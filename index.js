import * as qldaService from './qldaService.js';
import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
console.log('---------start the index.js--------------');

const rl = readline.createInterface({ input, output });
askQuestion();
async function askQuestion() {
    console.log('=======Quan Ly Du An Nhung Rat Thieu Nang==========');
    console.log("List of actions:");
    console.log("-login");
    console.log("-board");
    console.log("-list");
    console.log("-detail");
    console.log("-update");
    console.log("-auto");
    rl.question('please select your action: ', (answer) => {
        if (answer.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
            return;
        }
        listAction(answer.trim(), askQuestion);
    });
}
function listAction(answer, callBack){
    switch(answer){
        case 'login':
            qldaService.login().then(res=>{
                if(res == 1){
                    console.log('Login successful!');
                    return;
                }
                console.log("login failed");
                return;
            }).finally(()=>{
                return callBack();
            });
            break;
        case 'board':
            qldaService.getListBoard().then(res =>{
                console.log(res);
            }).finally(()=>{
                callBack();
            })
            break;
        case 'list':
            rl.question('Please type your board id: ', async (regis)=>{
                if(regis.trim() === ''){
                    console.log("Please type your board id !");
                    return callBack();
                }
                const boardId = regis.trim();
                let result = await qldaService.getUserListTask(boardId);
                console.log(result);
                callBack();
            });
            break;
        case 'detail':
            rl.question('Please type your task id: ', async (regis)=>{
                if(regis.trim() === ''){
                    console.log("Please type your board id !");
                    return callBack();
                }
                const taskId = regis.trim();
                let result = await qldaService.getTaskDetail(taskId);
                console.log(result);
                callBack();
            });
            break;
        case 'update':
            rl.question('Please type your task id: ', async (regis)=>{
                if(regis.trim() === ''){
                    console.log("Please type your board id !");
                    return callBack();
                }
                const taskId = regis.trim();
                let result = await qldaService.startOrStopTask(taskId);
                console.log(result);
                callBack();
            });
            break;
        case 'auto':
            rl.question('Please type your task id: ', async (regis)=>{
                if(regis.trim() === ''){
                    console.log("Please type your board id !");
                    return callBack();
                }
                const taskId = regis.trim();
                await qldaService.startOrStopTaskAuto(taskId, callBack);
            });
            break;
        default:
        console.log('Invalid action. Please try again.');
        callBack();
        break;
    }
}