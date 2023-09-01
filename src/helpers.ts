import fetch from "node-fetch";
import * as github from '@actions/github';

export interface LeapworkConfig {
    GITHUB_TOKEN: string,
    leapworkApiUrl: string,
    leapworkApiKey: string,
    leapworkSchedule: string
}

export interface FailedFlow {
    flowTitle: string,
    flowStatus: string,
    flowElapsed: string
}

const sleep = (ms: number): Promise<any> => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const callLeapworkApi = async (config: any, url: string, method: string = "GET"): Promise<any> => {
    const response = await fetch(config.leapworkApiUrl + url, {
        method,
        headers: { "AccessKey": config.leapworkApiKey }
    });
    return await response.json();
}

export const getScheduleId = async (config: any): Promise<string> => {
    const schedules = (await callLeapworkApi(config, "/v4/schedules")) as any[];
    const schedule = schedules.find(s => s.Title == config.leapworkSchedule);
    if (!schedule) throw "Could not find schedule '" + config.leapworkSchedule + "'";
    return schedule.Id;
}

export const getScheduleStatus = async (config: any, scheduleId: string): Promise<string> => {
    const result = await callLeapworkApi(config, "/v4/schedules/" + scheduleId + "/status");
    return result.Status;
}

export const waitForScheduleToBeFinished = async (config: any, scheduleId: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        const start = Date.now();
        while (true) {
            const scheduleStatus = await getScheduleStatus(config, scheduleId);
            const elapsed = Date.now() - start;
            console.log("Status:", scheduleStatus, "- elapsed", elapsed / 1000, "sec");
            if (scheduleStatus == "Finished") break;
            await sleep(10000);
        }
        resolve();
    });
}

export const runSchedule = async (config: any, scheduleId: string): Promise<string> => {
    const result = await callLeapworkApi(config, "/v4/schedules/" + scheduleId + "/runNow", "PUT");
    return result.RunId;
}

export const getRun = async (config: any, runId: string): Promise<[ number, number ]> => {
    const run = (await callLeapworkApi(config, "/v4/run/" + runId)) as any;
    return [ run.Failed, run.Total ];
}

export const getFailedRunItems = async (config: any, runId: string): Promise<Array<FailedFlow>> => {
    const result1 = (await callLeapworkApi(config, "/v3/run/" + runId + "/runItemIds")) as any;
    const runItemIds = result1.RunItemIds as any[];
    const failedFlows: FailedFlow[] = [];
    for (const runItemId of runItemIds) {
        const result2 = (await callLeapworkApi(config, "/v4/runItems/" + runItemId)) as any;
        const flowTitle = result2.FlowInfo.FlowTitle;
        const flowStatus = result2.FlowInfo.Status;
        const flowElapsed = result2.Elapsed;
        if (flowStatus != "Passed") {
            console.log(flowTitle, "was", flowStatus);
            failedFlows.push({ flowTitle, flowStatus, flowElapsed });
        }
    }
    console.log("Failed:", failedFlows);
    return failedFlows;
}

export const createIssue = (config: any, failedFlows: FailedFlow[]) => {
    // Create issue.
    const octokit = github.getOctokit(config.GITHUB_TOKEN);
    const actor = github.context.actor;
    const event = github.context.eventName;
    const message = github.context.payload.commits[0].message;
    const commit = JSON.stringify(github.context);
    const body = failedFlows.length + " failed flows:\n\n" +
        failedFlows.map(f => { return "* " + f.flowTitle + " - " + f.flowStatus + " (" + f.flowElapsed + ")\n" }) +
        "\n\n" +
        "Caused by " + actor + " on " + event + " with message '" + message + "'.";
    
    octokit.rest.issues.create({
        ...github.context.repo,
        title: failedFlows.length + " failed flows, commit by " + actor,
        body,
    });
}