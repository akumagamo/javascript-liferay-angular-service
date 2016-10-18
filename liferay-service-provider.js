"use strict";

const TYPES = {
	WEBCONTENT:0,
	DDLRECORD:1
};

const SERVICE_URLS = {
	BASE: "/api/jsonws",
	CREATE_JOURNAL: "/journalarticle/add-article",
	READ_JOURNAL: "/journalarticle/get-article",
	READ_ALL_JOURNAL: "/journalarticle/get-articles",
	UPDATE_JOURNAL: "/journalarticle/update-article",
	DELETE_JOURNAL: "/journalarticle/delete-article",
	CREATE_DDLRECORD: "/ddlrecord/add-record",
	UPDATE_DDLRECORD: "/ddlrecord/update-record"
};

const BASE_JOURNAL_DATA = {
	classNameId: 0,
	classPK: 0,
	articleId: "",
	autoArticleId: true,
	type: "general",
	layoutUuid: "",
	displayDateMonth: 1,
	displayDateDay: 1,
	displayDateYear: (new Date()).getFullYear(),
	displayDateHour: 0,
	displayDateMinute: 0,
	expirationDateMonth: 1,
	expirationDateDay: 1,
	expirationDateYear: (new Date()).getFullYear(),
	expirationDateHour: 0,
	expirationDateMinute: 0,
	neverExpire: true,
	reviewDateMonth: 1,
	reviewDateDay: 1,
	reviewDateYear: (new Date()).getFullYear(),
	reviewDateHour: 0,
	reviewDateMinute: 0,
	neverReview: true,
	indexable: true,
	articleURL: ""
};

angular.module("LiferayService", [])
	.provider("liferay", function () {
		var types = [];
		var token = "";
		return {
			setToken: function (authtoken) {
				token = authtoken;
			},
			addTypes: function (type) {
				types.push(type);
			},
			$get: ["$http", "$q", function ($http, $q) {
				return createObject($http, $q);
			}]
		};

		function isWebContentType(type){
			return (type != undefined ? type : TYPES.WEBCONTENT) === TYPES.WEBCONTENT;
		}

		function createObject($http, $q) {
			var serviceObject = {
				makeCall: function (urlpart, data) {
					console.info(SERVICE_URLS.BASE + urlpart);

					var helperPromise = $q.defer();

					var postPromise = $http.post(SERVICE_URLS.BASE + urlpart, data, {
						headers: { "Content-Type": "application/x-www-form-urlencoded", "Authorization": "Basic " + token },
						transformRequest: function (obj) {
							var formData = [];
							for (var property in obj) {
								formData.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));
							}
							return formData.join("&");
						}
					}
					).success(function (data) {
						console.info(data);
						console.info("data", arguments);
						helperPromise.resolve(data);
					}).error(function (message) {
						console.info("message", message);
						helperPromise.reject(message);
					});

					return helperPromise.promise;
				},
				createJournal: function (type, entry) {
					var newEntry = {};
					Object.assign(newEntry, BASE_JOURNAL_DATA, this._generateJournalEntry(type, entry));
					return this.makeCall(SERVICE_URLS.CREATE_JOURNAL, newEntry);
				},
				getJournal: function (type, id) {
					var result;
					if (id !== undefined) {
						result = this.makeCall(SERVICE_URLS.READ_JOURNAL, { groupId: type.groupId, articleId: id });
					} else {
						result = this.makeCall(SERVICE_URLS.READ_ALL_JOURNAL, { groupId: type.groupId, folderId: type.folderId });
					}
					return result;
				},
				updateJournal: function (type, entry, articleid) {
					var newEntry = {};
					Object.assign(newEntry, BASE_JOURNAL_DATA, this._generateJournalEntry(type, entry));
					newEntry["articleId"] = articleid;
					return this.makeCall(SERVICE_URLS.UPDATE_JOURNAL, newEntry);
				},
				deleteJournal: function (type, id) {
					return this.makeCall(SERVICE_URLS.DELETE_JOURNAL, { groupId: type.groupId, articleId: id, articleURL: "" });
				},
				createDDLRecord: function (type, entry) {

					var record = {};
					record["groupId"] = type.groupId;
					record["recordSetId"] = type.recordSetId;
					record["displayIndex"] = 0;
					record["fieldsMap"] = JSON.stringify(entry);

					return this.makeCall(SERVICE_URLS.CREATE_DDLRECORD, record);
				},
				updateDDLRecord: function (type, entry, id) {

					var record = {};
					record["recordId"] = id;
					record["mergeFields"] = true;
					record["displayIndex"] = 0;
					record["fieldsMap"] = JSON.stringify(entry);

					return this.makeCall(SERVICE_URLS.UPDATE_DDLRECORD, record);
				},
				_generateJournalContent: function (entry) {
					var innerData = "";
					for (var prop in entry) {
						if (entry.hasOwnProperty(prop)) {
							innerData +=
								"<dynamic-element name='" + prop + "'  type='text' index-type='keyword'  index='0'>" +
								"<dynamic-content language-id='en_US'><![CDATA[" + entry[prop] + "]]></dynamic-content>" +
								"</dynamic-element>";
						}
					}
					return "<?xml version='1.0'?><root available-locales='en_US' default-locale='en_US'>" + innerData + "</root>";
				},
				_generateJournalEntry: function (type, entry) {
					return {
						groupId: type.groupId,
						folderId: type.folderId,
						content: this._generateJournalContent(entry),
						titleMap: "{\"en_US\": \"Entry " + (new Date()).getTime() + "\"}",
						descriptionMap: "{\"en_US\": \"Auto generated\"}",
						ddmStructureKey: type.structureId,
						ddmTemplateKey: type.templateId
					};
				},
				_generateJournalJson: function (entry) {
					var expression = /name="([^"]+)"(?:.|\s)+?<!\[CDATA\[(.+)\]\]>/gi;
					var newObj = { _data: entry };
					var data;
					while (data = expression.exec(entry.content)) {
						newObj[data[1]] = data[2];
					}
					return newObj;
				}
			};

			types.forEach(function (value) {

				serviceObject[value.name] = {
					create: function (entry) {
						return isWebContentType(value.type)?serviceObject.createJournal(value, entry):serviceObject.createDDLRecord(value, entry);
					},
					update: function (entry, id) {
						return isWebContentType(value.type)?serviceObject.updateJournal(value, entry, id):serviceObject.updateDDLRecord(value, entry, id);
					},
					get: function (articleid) {
						if(value.type === TYPES.DDLRECORD){
							throw "Not Implemented";
						}
						return serviceObject.getJournal(value, articleid).then(function (data) {
							var result;
							if (articleid !== undefined) {
								result = serviceObject._generateJournalJson(data.data);
							} else {
								result = data.data.map(serviceObject._generateJournalJson);
							}
							return result;
						});
					},
					delete: function (articleid) {
						if(value.type === TYPES.DDLRECORD){
							throw "Not Implemented";
						}
						return serviceObject.deleteJournal(value, articleid);
					}
				};
			});
			return serviceObject;
		}
	});

