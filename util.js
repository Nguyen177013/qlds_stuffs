import * as fs from "fs";

export function getTime(addHours = 0){
    const now = new Date();
    now.setTime(now.getTime() + addHours * 60 * 60 * 1000);
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
export function hadName(targetName, listName){
    for(let i = 0; i < listName.length; i++){
        if(listName[i].toUpperCase() == targetName.toUpperCase()){
            return true;
        }
    }
    return false;
}
export function writeFile(json){
    fs.writeFile('./accounts.json', JSON.stringify(json, null, 2), (err)=>{
    });
}
export function log(log) {
    const logContent = JSON.stringify(log, null, 2) + '\n';
    fs.appendFile('./log.txt', logContent, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        }
    });
}
export function convertIntoMilliSecond(timeString){
    if(typeof timeString == 'number'){
        return timeString * 60 * 60 * 1000; // Convert hours to milliseconds
    }
    if(typeof timeString == 'string'){
        if(timeString.length <0){
            return 0;
        }
        let time = timeString.split(':')
        let hours = parseInt(time[0]) || 0;
        let minutes = parseInt(time[1]) || 0;
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0).getTime();
    }
}
export function checkTimeLimited(timeSchedule, timeLimited){
    return timeSchedule < timeLimited ;
}
export function createTaskDetail(obj){
    let result = {
        taskId: obj.TaskID,
        taskName: obj.TaskName,
        timeHasDone: obj.HourNum,
        timeLimited: obj.ScheduleH,
        startDate: obj.ScheduleSD,
        endDate: obj.ScheduleED
    };
    if(obj.StatusID != undefined){
        switch(obj.StatusID){
            case 0:
                result.status = 'Waiting';
                break;
            case 2:
                if(obj.DoingType){
                    result.status = obj.DoingType == 1 ? 'Doing' : 'Paused';
                }
                break;
            default:
                result.status = 'Unknown';
        }
    }
    return result;
}