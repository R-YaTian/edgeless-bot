import {log, requiredKeysValidator, sleep} from './utils';
import scraper from './scraper';
import Piscina from 'piscina';
import {executeTasks, getAllTasks, getSingleTask, getTasksToBeExecuted, removeExtraBuilds} from './task';
import {config} from './config';
import {ensurePlatform, getOS} from './platform';
import os from 'os';
import {clearWorkshop} from './workshop';
import {initAria2c, stopAria2c} from './aria2c';
import {readDatabase, report, setDatabaseNodeFailure, setDatabaseNodeSuccess, writeDatabase} from './database';
import {uploadToRemote} from './rclone';
import art from './art';

require('source-map-support').install();

async function main(): Promise<boolean> {
	//打印艺术字
	art();
	//平台校验
	//TODO:支持其他平台，实现require_windows
	if (getOS() != 'Windows') {
		log('Error:Unsupported platform : ' + os.platform());
		return false;
	}
	//命令校验
	if (!ensurePlatform()) {
		return false;
	}
	//重建工作目录
	if (!clearWorkshop()) {
		log('Error:Can\'t keep workshop clear : ' + config.DIR_WORKSHOP);
		return false;
	}
	//启动aria2c
	if (!(await initAria2c())) {
		log('Error:Can\'t initiate aria2c');
		return false;
	}
	//读取数据库
	readDatabase();
	//读取全部任务
	let tasks = config.SPECIFY_TASK ? [getSingleTask(config.SPECIFY_TASK).unwrap()] : getAllTasks().unwrap();
	//执行全部任务爬虫
	let results = await scraper(tasks);
	//console.log(JSON.stringify(results,null,2))

	//得到需要真正执行的任务数组
	let toExecTasks = getTasksToBeExecuted(results);

	//执行所有需要执行的任务
	let eRes = await executeTasks(toExecTasks);
	for (let node of eRes) {
		if (node.result.ok) {
			//去重
			let task = getSingleTask(node.taskName).unwrap();
			let newBuilds = removeExtraBuilds(node.taskName, task.category, node.result.val);
			//上传
			if (uploadToRemote(node.result.val, task.category)) {
				setDatabaseNodeSuccess(node.taskName, newBuilds);
			} else {
				setDatabaseNodeFailure(node.taskName, 'Error:Can\'t upload target file');
			}
		} else {
			setDatabaseNodeFailure(node.taskName, node.result.val);
		}
	}

	//保存数据库
	writeDatabase();
	//停止aria2c
	await stopAria2c();
	//打印报告
	return report();
}

async function test(): Promise<boolean> {
	console.log(requiredKeysValidator({
		a: {
			b: {
				c: '114',
			},
		},
	}, ['a.b.d']));
	return true;
}

if (!Piscina.isWorkerThread) {
	main().then(async result => {
		await sleep(1000);
		process.exit(result ? 0 : 1);
	});
}
