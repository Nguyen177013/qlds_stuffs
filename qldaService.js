import * as util from './util.js';
import * as dotenv from 'dotenv';
import * as fs from "fs";
import axios from 'axios';
const myEnv = dotenv.config();
const listIgnoreAction = JSON.parse(myEnv.parsed['IGNORE_ACTIONS_NAME']);
const userName = myEnv.parsed['USERNAME'];
const password = myEnv.parsed['PASSWORD'];
let listUser = {};
fs.readFile("./accounts.json", "utf8", (error, data) => {
    let account = JSON.parse(data);
    listUser = account;
})
export async function login(){
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/Token': '';
    if(requestUrl == ''){
        console.log('BASE_URL is not defined');
        return;
    }
    const request = {
        type: '0',
        grant_type: 'password',
        username: userName,
        password: password
    }
    try{
        const response = await axios({
            url: requestUrl,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            data: request
        });
        if (response.status === 200 && response.data != null) {
            const userDetail = response.data;
            const userInfo = {
                token: userDetail.access_token,
                userName: userDetail.UserName,
                userId: userDetail.AccountID
            };
            listUser[userName] = userInfo;
            util.writeFile(listUser);
            return 1;
        } else {
            return 0;
        }
    } catch(err){
        if (err.response && err.response.status === 400) {
            console.log('login failed');
            console.log('please check your username and password again');
            return 0
        } else {
            console.log('error while trying to reach ' + requestUrl);
            console.log('login failed something went wrong');
            let logError = '\n===login failed===\n';
            logError+= err;
            util.log(log);
            return 0;
        }
    }
}
export async function getListBoard(){
    const userLogedIn = await checkUserLogin(userName)
    if(!userLogedIn){
        console.log('user token is expired or not loged in');
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/Board': '';
    if(requestUrl == ''){
        console.log('BASE_URL is not defined');
        return 'Invalid base url';
    }
    try{
        const response = await axios({
            url: requestUrl,
            method: 'GET',
            headers: {
                'authorization': 'Bearer '+listUser[userName].token,
                'Content-Type': 'application/json',
                'username': userName
            }
        });        
        if (response.status === 200 && response.data != null) {
            const result = [];
            const boardList = response.data.Data;
            for(let i=0; i< boardList.length; i++){
                const board = boardList[i];
                const boardInfo = {
                    id: board.ID,
                    name: board.Name,
                };
                result.push(boardInfo);
            }
            return result;
        }
    }catch(err){
        console.log("error while trying to get list board");
        let logError = '\n===error while trying to get list board===\n';
        logError+= err;
        util.log(log);
    }
}
export async function getUserListTask(boardId=''){
    if(boardId.length == 0 || boardId == ''){
        console.log('boardId is empty');
        return 'Please type your board id !';
    }
    const userLogedIn = await checkUserLogin(userName)
    if(!userLogedIn){
        console.log('user token is expired or not loged in');
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/Step/Search': '';
    try{
        const params = {
            boardID: boardId,
            searchText: '',
            projectID: '',
            customerID: 0,
            reporterID: '',
            assigneeID: listUser[userName].userId,
            statusID: -1,
            ratingID: -1
        }
        const headers= {
            'authorization': 'Bearer '+listUser[userName].token,
            'Content-Type': 'application/json',
            'username': userName
        }
        const response = await axios.get(requestUrl,{
            params: params,
            headers: headers
        });
        if (response.status === 200 && response.data != null) {
            const taskActions = response.data.Data.Tasks;
            const result = [];
            for(let i=0; i< taskActions.length; i++){
                if(util.hadName(taskActions[i].Name, listIgnoreAction)){
                    continue;
                }
                const tasks = taskActions[i].Tasks;
                const listTaskDetail = [];
                for(let j=0; j< tasks.length; j++){
                    if(tasks[j].StatusID == 10 || tasks[j].StatusID == 3){
                        continue;
                    }
                    const task = await getTaskDetail(tasks[j].ID);
                    if(task.taskId != undefined){
                        listTaskDetail.push(JSON.stringify(task, null, 2));
                    }
                }
                const taskDetail = {
                    taskId: taskActions[i].ID,
                    taskName: taskActions[i].Name,
                    taskTotal: taskActions[i].Tasks.length,
                    tasks: listTaskDetail
                }
                result.push(taskDetail);
            }
            if(result.length == 0){
                console.log("Currently you have no task to do");
                return 1;
            }
            console.log(result);
            return 1;
        }
    }catch(err){
        let logError = "error while trying to get list task";
        log+= logError + '\n'+ err;
        console.log('===error while trying to get list task===');
        return util.log(log);
    }
}
// prototype: 'v2' - this is a new version of the function that returns a list of tasks by using user uid
export async function getUserListTaskV2(){
    const userLogedIn = await checkUserLogin(userName)
    if(!userLogedIn){
        console.log('user token is expired or not loged in');
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/DashboardQLCV/getDataRP': '';
    try{
        const params = {
            searchText: '',
            projectIDs: '',
            uids: listUser[userName].userId,
        }
        const headers= {
            'authorization': 'Bearer '+listUser[userName].token,
            'Content-Type': 'application/json',
            'username': userName
        }
        const response = await axios.get(requestUrl,{
            params: params,
            headers: headers
        });
        if (response.status === 200 && response.data != null) {
            if(response.data.Status != 1){
                console.log('can not get list task, please try again');
                return 0;
            }
            const doingAssigneeTask = response.data.Data.DoingAssigneeTask;
            const doingAssigneeTaskStart = response.data.Data.DoingAssigneeTaskStart;
            const doingCreateByTaskNotStart = response.data.Data.DoingCreateByTaskNotStart;
            const doingCreateByTaskStart = response.data.Data.DoingCreateByTaskStart;
            const result = [];
            if(Array.isArray(doingAssigneeTask) && doingAssigneeTask.length > 0){
                for(let i=0; i< doingAssigneeTask.length; i++){
                    if(doingAssigneeTask[i].StatusID == 10 || doingAssigneeTask[i].StatusID == 3){
                        continue;
                    }
                    const taskDetail = util.createTaskDetail(doingAssigneeTask[i]);
                    result.push(taskDetail);
                }
            }
            if(Array.isArray(doingAssigneeTaskStart) && doingAssigneeTaskStart.length > 0){
                for(let i=0; i< doingAssigneeTaskStart.length; i++){
                    if(doingAssigneeTaskStart[i].StatusID == 10 || doingAssigneeTaskStart[i].StatusID == 3){
                        continue;
                    }
                    const taskDetail = util.createTaskDetail(doingAssigneeTaskStart[i]);
                    result.push(taskDetail);
                }
            }
            if(Array.isArray(doingCreateByTaskNotStart) && doingCreateByTaskNotStart.length > 0){
                for(let i=0; i< doingCreateByTaskNotStart.length; i++){
                    if(doingCreateByTaskNotStart[i].StatusID == 10 || doingCreateByTaskNotStart[i].StatusID == 3){
                        continue;
                    }
                    const taskDetail = util.createTaskDetail(doingCreateByTaskNotStart[i]);
                    result.push(taskDetail);
                }
            }
            if(Array.isArray(doingCreateByTaskStart) && doingCreateByTaskStart.length > 0){
                for(let i=0; i< doingCreateByTaskStart.length; i++){
                    if(doingCreateByTaskStart[i].StatusID == 10 || doingCreateByTaskStart[i].StatusID == 3){
                        continue;
                    }
                    const taskDetail = util.createTaskDetail(doingCreateByTaskStart[i]);
                    result.push(taskDetail);
                }
            }
            if(result.length == 0){
                console.log("Currently you have no task to do");
                return 1;
            }
            console.log(result);
            return 1;
        }
    }catch(err){
        let logError = "===error while trying to get list task===";
        log+= logError + '\n'+ err;
        console.log('error while trying to get list task');
        util.log(log)
        return 0;
    }
}

export async function startOrStopTask(taskId){
    if(taskId == undefined || taskId == ''){
        console.log('taskId is empty');
        return 'Vui lòng nhập mã task';
    }
    const userLogedIn = await checkUserLogin(userName)
    if(!userLogedIn){
        console.log('user token is expired or not loged in');
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/Task/Done': '';
    const headers= {
        'authorization': 'Bearer '+listUser[userName].token,
        'Content-Type': 'application/json',
        'username': userName
    }
    const body = {
        "ID": taskId,
        "DoingFlg": true
    }
    try{
        const response = await axios.post(requestUrl, body,{
            headers: headers,
        });
        if(response.status === 200 && response.data != null){
            if(response.data.Status == 0){
                console.log('task does not exist or has been deleted');
                return 0;
            }
            return 1;
        }
    }catch(err){
        console.log("error while trying to updated task");
        let logError = '\n===error while trying to updated task===\n';
        logError+= err;
        util.log(log);
    }
}
export async function getTaskDetail(taskId){
    if(taskId == undefined || taskId == ''){
        console.log('taskId is empty');
        return null;
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/Task': '';
    try{
        const params ={
            iD: taskId
        }
        const headers= {
            'authorization': 'Bearer '+listUser[userName].token,
            'Content-Type': 'application/json',
            'username': userName
        }
        const response = await axios.get(requestUrl,{
            params,
            headers: headers
        });
        if(response.status === 200 && response.data != null){
            const taskDetail = response.data.Data;
            if(listUser[userName].taskPending == undefined){
                listUser[userName].taskPending = [];
            }
            if(taskDetail.taskDetailStatusID!= undefined && taskDetail.taskDetailStatusID == '10'){
                return {}
            }
            listUser[userName].taskPending.push(taskDetail.ID);
            const taskInfo = {
                taskId: taskDetail.ID,
                taskName: taskDetail.Name,
                timeHasDone: taskDetail.HourNum,
                timeLimited: taskDetail.ScheduleH,
                startDate: taskDetail.ScheduleStartDate,
                stepId: taskDetail.StepID,
                endDate: taskDetail.ScheduleEndDate
            }
            if(taskDetail.StatusID != undefined){
                switch(taskDetail.StatusID){
                    case 0:
                        taskInfo.status = 'Waiting';
                        break;
                    case 2:
                        if(taskDetail.DoingType){
                            taskInfo.status = taskDetail.DoingType == 1 ? 'Doing' : 'Paused';
                        }
                        break;
                    default:
                        taskInfo.status = 'Unknown';
                }
            }
            return taskInfo;
        }
        return {};
    }catch(err){
        console.log('\n===can not get task detail===\n');
        let logError = '\n===can not get task detail===\n';
        logError+= err;
        util.log(log);
    }
}
export async function writeReport(taskId){
    if(taskId == undefined || taskId == ''){
        console.log('taskId is empty');
        return null;
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/Task/insertComment': '';
    try{
        const body ={
            comment: "Hoàn thành",
            Task_ID: taskId,
            FileUrls: []
        }
        const headers= {
            'authorization': 'Bearer '+listUser[userName].token,
            'Content-Type': 'application/json',
            'username': userName
        }
        const response = await axios.post(requestUrl, body,{
            headers: headers
        });
        if(response.status === 200 && response.data != null){
            const taskDetail = response.data;
            console.log("write log successfully");
        }
        return 1;
    }catch(err){
        console.log('can not write report task');
        let logError = '\n===can not write report task===\n';
        logError+= err;
        util.log(log);
        return 0;
    }
}
export async function markCompletedTask(taskId){
    if(taskId == undefined || taskId == ''){
        console.log('taskId is empty');
        return null;
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/Task/Done': '';
    try{
        const body ={
            ID: taskId,
            DoingFlg: false
        }
        const headers= {
            'authorization': 'Bearer '+listUser[userName].token,
            'Content-Type': 'application/json',
            'username': userName
        }
        const response = await axios.post(requestUrl, body,{
            headers: headers
        });
        if(response.status === 200 && response.data != null){
            const taskDetail = response.data;
            console.log("mark task completed");
        }
        return 1;
    }catch(err){
        console.log('can not mark task completed');
        let logError = '\n===can not mark task completed===\n';
        logError+= err;
        util.log(log);
        return 0;
    }
}
export async function startOrStopTaskAuto(taskId, callBack){
    try{
        const taskDetail = await getTaskDetail(taskId);
        if(taskDetail == null || taskDetail.taskId == undefined){
            console.log('Task does not exist or completed');
            return callBack();
        }
        if(taskDetail.status == 'Doing'){
            console.log('Task is already in progress');
            return callBack();
        }
        let timeLimited = taskDetail.timeLimited != undefined ? taskDetail.timeLimited : 0;
        if(taskDetail.timeHasDone != null){
            timeLimited = timeLimited - taskDetail.timeHasDone;
        }
        if(timeLimited <= 0){
            await writeReport(taskId);
            await markCompletedTask(taskId);
            await endStepTask(taskId, taskDetail);
            return callBack();
        }
        let limitedTime = timeLimited * 60 * 60 * 1000;
        console.log("Started auto at " +util.getTime());
        const deadline = util.getTime(timeLimited);
        console.log("See you in "+ deadline);
        await startOrStopTask(taskId);
        setTimeout(async ()=>{
            console.log("Stoped auto at: " +util.getTime());
            await startOrStopTask(taskId);
            await writeReport(taskId);
            await markCompletedTask(taskId);
            await endStepTask(taskId, taskDetail);
        }, limitedTime);
        callBack();
    }catch(err){
        console.log('can not auto start task');
        let logError = '\n===start task auto===\n';
        logError+= err;
        util.log(log);
        return callBack();
    }
}
async function  getBoardByTaskId(taskId){
    if(taskId == undefined || taskId == ''){
        console.log('taskId is empty');
        return null;
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/DashboardQLCV/getBoardByTaskId': '';
    const params = {
       iD: taskId
    }
    if(requestUrl == ''){
        console.log('BASE_URL is not defined');
        return 'Invalid base url';
    }
    try{
        const response = await axios.get(requestUrl,{
            params: params,
            headers: {
                'authorization': 'Bearer '+listUser[userName].token,
                'Content-Type': 'application/json',
                'username': userName
            }
        });      
        if (response.status === 200 && response.data != null) {
            const boardId = response.data.Data;
            return boardId.BoardID ? boardId.BoardID : null;;
        }
    }catch(err){
        console.log("error while trying to get board by task ID");
        let logError = '\n===error while trying to get board by task ID===\n';
        logError+= err;
        util.log(log);
    }
}
async function getStepByBoardId(boardID){
    if(boardID == undefined || boardID == ''){
        console.log('boardID is empty');
        return null;
    }
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/Step/GetByBoardID': '';
    const params = {
        boardID: boardID
    }
    if(requestUrl == ''){
        console.log('BASE_URL is not defined');
        return 'Invalid base url';
    }
    try{
        const response = await axios.get(requestUrl,{
            params: params,
            headers: {
                'authorization': 'Bearer '+listUser[userName].token,
                'Content-Type': 'application/json',
                'username': userName
            }
        });      
        if (response.status === 200 && response.data != null) {
            const steps = response.data.Data;
            const result = [];
            if(steps != undefined && steps.length > 0){
                for(let i=0; i< steps.length; i++){
                    const step = steps[i];
                    const stepInfo = {
                        id: step.ID,
                        name: step.Name,
                    };
                    result.push(stepInfo);
                }
                return result;
            }
            return [];
        }
    }catch(err){
        console.log("error while trying to get board by task ID");
        let logError = '\n===error while trying to get board by task ID===\n';
        logError+= err;
        util.log(log);
    }
}
export async function endStepTask(taskId, data = null){
    if(taskId == undefined || taskId == ''){
        console.log('taskId is empty');
        return null;
    }
    let taskData = data;
    if(taskData == null || taskData == undefined){
        taskData = await getTaskDetail(taskId);
    }
    const boardId = await getBoardByTaskId(taskId);
    const listStep = await getStepByBoardId(boardId);
    if(listStep == null || listStep.length == 0){
        console.log('can not get step by board ID');
        return 0;
    }
    const endStep = listStep[listStep.length - 2];
    const requestUrl = myEnv.parsed['BASE_URL'] != undefined ? myEnv.parsed['BASE_URL']+'/api/Step/UpdateTaskByStep': '';
    if(requestUrl == ''){
        console.log('BASE_URL is not defined');
        return 'Invalid base url';
    }
    const request = {
        ID: taskId,
        StepID_1: taskData.stepId,
        StepID_2: endStep.id,
    }
    try{
        const response = await axios({
            url: requestUrl,
            method: 'POST',
            headers: {
                'authorization': 'Bearer '+listUser[userName].token,
                'Content-Type': 'application/json',
                'username': userName
            },
            data: request
        });   
        if (response.status === 200 && response.data != null) {
            console.log('Updated into last step');
            return 1;
        }
    }catch(err){
        console.log("error while trying to end step by task ID");
        let logError = '\n===error while trying to end step by task ID===\n';
        logError+= err;
        util.log(log);
        return 0;
    }
}
async function checkUserLogin(userName){
    if(listUser[userName] == undefined){
        await login(userName, password);   
        if (!listUser[userName] || typeof listUser[userName] !== "object"){
            return false;
        }
    }
    return true;
}