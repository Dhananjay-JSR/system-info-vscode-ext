import * as vscode from 'vscode';
import si = require('systeminformation');
import os = require('os');
const { exec } = require('child_process');
let intervalIdSpeed:NodeJS.Timeout;
let intervalIdCpuRam:NodeJS.Timeout;
let statusBarSpeed:vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right,100);	//assigning statusbar function to a variable for a separate init
let statusBarCpuRam:vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left,100);	
let enabledSpeed:boolean = true;
let enabledCPURam:boolean = true;
let osVersion:string;
let ramUsage:string;
let cpuUsage:string;
export function activate(context: vscode.ExtensionContext) {
	osVersion = os.platform();
	let disposable = vscode.commands.registerCommand('extension.show_hide_speed',()=>{
		enabledSpeed = !enabledSpeed;
		if (enabledSpeed===false){
			statusBarSpeed.hide();
			clearInterval(intervalIdSpeed);
		}
		else if (enabledSpeed===true){
			updateStatusBarSpeed();
			statusBarSpeed.show();
		}
	});
	let disposableCPU = vscode.commands.registerCommand('extension.show_hide_ram_cpu',()=>{
		enabledCPURam = !enabledCPURam;
		if (enabledCPURam===false){
			statusBarCpuRam.hide();
			clearInterval(intervalIdCpuRam);
		}
		else if (enabledCPURam===true){
			
			updateStatusBarCpuRam();
			statusBarCpuRam.show();
		}
	});
	updateStatusBarSpeed();
	updateStatusBarCpuRam();
	statusBarSpeed.show();
	statusBarCpuRam.show();
	statusBarSpeed.text="Initialising Extension";
	statusBarCpuRam.text="Please Wait Bit";
	statusBarCpuRam.color="cyan";
	statusBarSpeed.color="cyan";
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarSpeed));
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarSpeed));
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarCpuRam));
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarCpuRam));
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposableCPU);
}
export function deactivate() {
	vscode.window.setStatusBarMessage("Thankyou for using my Extension - Dhananjay");
}
function updateStatusBarSpeed(): void {
	statusBarSpeed.text=`Down :- 0.000 mbps | Up:- 0.000 mbps`;
	intervalIdSpeed = setInterval(()=>{
		si.networkStats().then(data => {
			statusBarSpeed.text=`Down :- ${(data[0].rx_sec/Math.pow(1024,2)).toFixed(3)} mbps | Up:- ${(data[0].tx_sec/Math.pow(1024,2)).toFixed(3)}  mbps`;
			statusBarSpeed.color="yellow";
		});
	}, 1000);
}
function updateStatusBarCpuRam(): void {
	osVersion = os.platform();
	intervalIdCpuRam = setInterval(()=>{
		si.mem().then(memdata => {
			ramUsage=(((memdata.used/memdata.total)*100)).toFixed(2);
			if (osVersion==="win32"){
				exec('wmic cpu get loadpercentage',(err:string,stdout:string,stderr:string)=>{
					if (err){
						cpuUsage=`Error Code 1 Please Open Issue`;
					  return;
					}
					if (stderr){
						cpuUsage=`Error Code 2 Please Open Issue`;
					  return ;
					}
					cpuUsage = stdout.substring(15);
					cpuUsage=cpuUsage.replace(/\s/g, '');
					statusBarCpuRam.text=`RAM Usage :- ${ramUsage}% | CPU Usage:- ${cpuUsage} %`;
					statusBarCpuRam.color="yellow";
				  });
			}
			else{
				cpuUsage=`Still work in Progress for ${osVersion}`;
			}
		});
	}, 1000);
}