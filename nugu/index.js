const uuid = require('uuid').v4;
const _ = require('lodash');
const { DOMAIN } = require('../config');
const crawler = require('./crawler');

class NPKRequest {
	constructor (httpReq) {
		this.context = httpReq.body.context;
		this.action = httpReq.body.action;
		this.actionName = "";
		this.parameters = "";
		console.log(`NPKRequest: ${JSON.stringify(this.context)}, ${JSON.stringify(this.action)}`);
	}

	do(npkResponse) {
		this.actionRequest(npkResponse);
	}

	actionRequest(npkResponse) {
		console.log('actionRequest');
		console.dir(this.action);

		const actionName = this.action.actionName;
		const parameters = this.action.parameters;

		switch (actionName) {
			case 'AwnserLunchAction':
				this.AwnserLunchAction(parameters);
				break;
		}
	}

	async AwnserLunchAction(params) {
		let result = {};
		let urlDate = "";
		let outDate = "";

		if (params.lunch_day) {
			switch (params.lunch_day.value) {
				case 'YESTERDAY':
					urlDate = new Date().getFullYear() + (new Date().getMonth() + 1).toString().padStart(2, "0") + (new Date().getDate() - 1).toString().padStart(2, "0");
					outDate = "어제";
					break;
				case 'TODAY':
					urlDate = new Date().getFullYear() + (new Date().getMonth() + 1).toString().padStart(2, "0") + (new Date().getDate()).toString().padStart(2, "0");
					outDate = "오늘";
					break;
				case 'TOMORROW':
					urlDate = new Date().getFullYear() + (new Date().getMonth() + 1).toString().padStart(2, "0") + (new Date().getDate() + 1).toString().padStart(2, "0");
					outDate = "내일";
					break;
			}
		} else {
			if (params.lunch_year == undefined && params.lunch_month == undefined) {
				urlDate = new Date().getFullYear() + (new Date().getMonth() + 1).toString().padStart(2, "0") + params.lunch_mday.value.toString().padStart(2, "0");
				outDate = new Date().getFullYear() + "년 " + (new Date().getMonth() + 1) + "월 " + params.lunch_mday.value + "일";
			} else if (params.lunch_year == undefined) {
				urlDate = new Date().getFullYear() + params.lunch_month.value.toString().padStart(2, "0") + params.lunch_mday.value.toString().padStart(2, "0");
				outDate = (new Date().getFullYear().toString()) + "년 " + params.lunch_month.value + "월 " + params.lunch_mday.value + "일";
			} else {
				urlDate = params.lunch_year.value + params.lunch_month.value.toString().padStart(2, "0") + params.lunch_mday.value.toString().padStart(2, "0");
				outDate = params.lunch_year.value + "년 " + params.lunch_month.value + "월 " + params.lunch_mday.value + "일";
			}
		}

		await new Promise((resolve, reject) => {
			crawler(urlDate, function(menu) {
				result.lunch_menu = menu;
				resolve("a");
			});
		});

		result.day_output = outDate;

		console.log(result);

		npkResponse.setAwnserLunchActionOutput(result);
	}
}

class NPKResponse {
	constructor () {
		console.log('NPKResponse constructor');

		this.version = '2.0';
		this.resultCode = 'OK';
		this.output = {};
		this.directives = [];
	}

	setAwnserLunchActionOutput(result) {
		console.log("*** set output parameters");
		this.output = {
			lunch_menu: result.lunch_menu,
			day_output: result.day_output
		}
	}

}

const nuguReq = function(httpReq, httpRes, next) {
	npkResponse = new NPKResponse();
	npkRequest = new NPKRequest(httpReq);
	npkRequest.do(npkResponse);
	console.log(`NPKResponse: ${JSON.stringify(npkResponse)}`);

	setTimeout(()=> {
		console.log("*** end response");
		return httpRes.send(npkResponse);
	}, 500);
};

module.exports = nuguReq;