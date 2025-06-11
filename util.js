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
export function log(log){
    fs.writeFile('./log.txt',JSON.stringify(log, null, 2), (err)=>{
    });
}