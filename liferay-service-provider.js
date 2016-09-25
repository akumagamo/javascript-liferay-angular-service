	"use strict";
	
	const SERVICE_URLS = {
		BASE: "/api/jsonws/journalarticle",
		CREATE: "/add-article",
		READ: "/get-article",
		READ_ALL: "/get-articles/",
		UPDATE: "/update-article",
		DELETE: "/delete-article"
	};
	
	const BASE_ARTICLE_DATA = {
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
		.provider("liferay", function(){
			var types = [];
			var liferayToken = "";
			return {
				setAuthToken: function(authtoken){
					liferayToken = authtoken;
				},
				addTypes: function(type){
					types.push(type);
				},
				$get: ["$http", function($http){
					return createObject($http);
				}]
			};
		
			function createObject($http){
				var serviceObject = {
					makeCall: function(urlpart, data ){
						return $http.post( SERVICE_URLS.BASE + urlpart, data, {
								headers: {"Content-Type": "application/x-www-form-urlencoded"},
								transformRequest: function(obj) {
									var formData = [];
									for(var property in obj){
										formData.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));
									}
									return formData.join("&");
								}
							}
						);
					},
					create: function(type, entry){
						var newEntry = {};
						Object.assign(newEntry, BASE_ARTICLE_DATA, this.generateLiferayEntry(type, entry));
						newEntry["p_auth"] = liferayToken;
						return this.makeCall(SERVICE_URLS.CREATE, newEntry);
					},
					get: function(type, id){
						var result;
						if(id!==undefined){
							result = this.makeCall(SERVICE_URLS.READ, {groupId: type.groupId, articleId: id, p_auth:liferayToken});
						} else {
							result = this.makeCall(SERVICE_URLS.READ_ALL, {groupId:type.groupId, folderId:type.folderId, p_auth:liferayToken});
						}
						return result;
					},
					update: function(type, entry, articleid){
						var newEntry = {};
						Object.assign(newEntry, BASE_ARTICLE_DATA, this._generateLiferayEntry(type, entry));
						newEntry["p_auth"] = liferayToken;
						newEntry["articleId"] = articleid;
						return this.makeCall(SERVICE_URLS.UPDATE, newEntry);
					},
					delete: function(type, id){
						return this.makeCall(SERVICE_URLS.DELETE, {groupId:type.groupId, articleId: id, articleURL: "", p_auth:liferayToken});
					},
					_generateContent: function(entry){
						var innerData = "";
						for(var prop in entry){
							if(entry.hasOwnProperty(prop)){
								innerData += 
								"<dynamic-element name='" + prop + "'  type='text' index-type='keyword'  index='0'>" +
								"<dynamic-content language-id='en_US'><![CDATA[" + entry[prop] + "]]></dynamic-content>" +
								"</dynamic-element>";
							}
						}
						return "<?xml version='1.0'?><root available-locales='en_US' default-locale='en_US'>" + innerData + "</root>";
					},
					_generateLiferayEntry: function(type, entry){
						return {
							groupId: type.groupId,
							folderId: type.folderId,
							content: this._generateContent(entry),
							titleMap: "{\"en_US\": \"Entry "+  (new Date()).getTime() +"\"}",
							descriptionMap: "{\"en_US\": \"Auto generated\"}",
							ddmStructureKey: type.structureId,
							ddmTemplateKey: type.templateId
						};
					},
					generateJsonEntry: function(entry){
						var expression = /name="([^"]+)"(?:.|\s)+?<!\[CDATA\[(.+)\]\]>/gi;
						var newObj = {_data:entry};
						var data;
						while(data = expression.exec(entry.content)){
							newObj[data[1]] = data[2];
						}
						return newObj;
					}
				};
				
				types.forEach(function(value){
					serviceObject[value.name] = {
						create: function(entry){
							return serviceObject.create(value, entry);
						},
						update: function(entry,  articleid){
							return serviceObject.update(value, entry,  articleid);
						},
						get: function(articleid){
							return serviceObject.get(value, articleid).then(function(data){
								var result;
								if(articleid!==undefined){
									result = serviceObject.generateJsonEntry(data.data);
								}else{
									result = data.data.map(serviceObject.generateJsonEntry);
								}
								return result;
							});
						},
						delete:function(articleid){
							return serviceObject.delete(value, articleid);
						}
					};
				});
				return serviceObject;
			}
	});