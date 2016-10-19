# Angular Liferay Service Provider
## Versionnumber 0.2.0 (2016-10-18) Beta
(***Documentation last update 2016-10-18 20:30***)

Angular module for Liferay JournalArticles and DDLRecords   
![Screenshot Code](https://raw.githubusercontent.com/akumagamo/javascript-liferay-angular-service/master/readme/screenshot_01.png "Screenshot from Code")  

## Features
* CRUD Operations for WebContent
* CU Operations for DDLRecords

## WIP    

## Roadmap / Future Features
* multilanguage
* different possible types of structure fields
* optimized code
* add Read and Delete Operations for DDLRecords

## Known Bugs
* if the service returns an error, but sends a 200 HTTP Status code, the error is not detected

## Usage
1) load the scripts
2) configure the structure types as:
    * JournalArticle
    * DDLRecord
3) done

```HTML
    <script src="angular.min.js"></script>
    <script src="liferay-service-provider.js"></script>
    <script>
      (function(app){
        "use strict";	
          app.config(["liferayProvider", function (liferayProvider) {
            liferayProvider.setToken(btoa("newsletterservice:newsletterservice"));
            // setup for each type
            liferayProvider.addTypes({name:"WebContent", groupId: 24913, folderId: 24927, structureId: 24930, templateId: 24932});
            liferayProvider.addTypes({name:"DDLRecord", type: TYPES.DDLRECORD, groupId: 24913, recordSetId: 25719});
          }])
          .controller("testCtrl", ["$scope", "liferay", 
            function($scope, liferay){
              $scope.messages = "Up and running!";
              liferay["WebContent"].get().then(function(){console.info(arguments[0]);});
              liferay["WebContent"].get("25004").then(function(){console.info(arguments[0]);});

              liferay["WebContent"].create({Email:$scope.Email}).then(function(){
							    console.info( arguments);
              });

              liferay["DDLRecord"].create({Email:$scope.Email}).then(function(){
							    console.info( arguments);
              });
            
          }]);
      }(angular.module("app", ["LiferayService"])));
    </script>
```

## SourceControl Link & Information
https://github.com/akumagamo/javascript-liferay-angular-service.git

## Documentation

### File / Folder Structure

     +-+- javascript-liferay-angular-service
       +-+- readme
       | +- screenshot_01.png
       +- liferay-service-provider.js
       +- readme.md (this document)
       +- LICENSE

### Functions

#### create(entry)
Creates a new entry.

#### get(optional: id)
Returns single Article or all if no Id is set.

#### update(entry, id)
Update passed article, creates a new version (Standard functionality).

#### delete(id)
delete article with the passed id (all versions).
