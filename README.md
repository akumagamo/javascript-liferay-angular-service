# Angular Liferay JournalArticles
## Versionnumber 0.2.0 (2016-09-30) Beta
(***Documentation last update 2016-09-30 20:00***)

Angular module for Liferay JournalArticles   
![Screenshot Code](https://raw.githubusercontent.com/akumagamo/javascript-liferay-angular-service/master/readme/screenshot_01.png "Screenshot from Code")  

## Features
* CRUD Operations

## WIP    

## Roadmap / Future Features
* multilanguage
* different possible types of structure fields
* optimized code

## Known Bugs
* if the service returns an error, but sends a 200 HTTP Status code, the error is not detected

## Usage
1) load the scripts
2) configure the structure types
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
            liferayProvider.addTypes({name:"Newsletter", groupId: 24913, folderId: 24927, structureId: 24930, templateId: 24932});
          }])
          .controller("testCtrl", ["$scope", "liferay", 
            function($scope, liferay){
              $scope.messages = "Up and running!";
              liferay["Newsletter"].get().then(function(){console.info(arguments[0]);});
              liferay["Newsletter"].get("25004").then(function(){console.info(arguments[0]);});
            
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
       +- readme.md (this document)
       +- LICENSE

### Functions

#### create(entry)
Creates a new entry.

#### get(optional: id)
Returns single Article or all if no Id is set.

#### update(entry)
Update passed article, creates a new version (Standard functionality).

#### delete(id)
delete article with the passed id (all versions).
