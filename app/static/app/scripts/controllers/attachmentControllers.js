app.controller("AttachmentController", function($scope, Attachment, AttachmentUploader, attachments, tags, $uibModal, $log){
    $scope.attachments = attachments["attachments"];
    $scope.tags = tags["tags"];
    $scope.fileObjs = [];
    $scope.remveFileObj = function(index){
        $scope.fileObjs.splice(index, 1);
    }
    $scope.clearFileObjs = function(){
        $scope.fileObjs = [];
    }

    //listen for the file selected event
    $scope.$on("fileSelected", function (event, args) {
        $scope.$apply(function () {            
            //add the file object to the scope's files collection
            var fileObj = {
                "file": args.file,
                "status": "Pending",
                "tagInfo": {
                    "selectedTags": [],
                    "toggleSelection": function(id){
                        var index = this.selectedTags.indexOf(id);
                        if(index > -1){
                            this.selectedTags.splice(index, 1)
                        }
                        else{
                            this.selectedTags.push(id);
                        }
                    }
                }
            };
            
            $scope.fileObjs.push(fileObj);
        });
    });
    
    $scope.attachmentOperations = {
        "createAttachment": function(index){
            $scope.fileObjs[index].status = "loading";
            AttachmentUploader($scope.fileObjs[index]).
                success(function(data){
                    $scope.attachments.push(data["attachment"]);
                    $scope.fileObjs[index].status = "success";
                }).
                error(function(){
                    $scope.fileObjs[index].status = "danger";
                });

        },
        "deleteAttachment": function(id, index){
            Attachment.delete({id: id}).$promise.then(
                function(response){
                    $scope.attachments.splice(index, 1);
                },
                function(){
                    alert("fail to delete attachment");
                }
            );
        },
        "updateAttachment": function(index){
            var editAttachmentModalInstance = $uibModal.open({
                animation: true,
                templateUrl: "edit-attachment-modal",
                controller: "EditAttachmentModalController",
                size: "lg",
                resolve: {
                    attachment: function () {
                        return $scope.attachments[index];
                    }, 
                    tags: function(){
                        return $scope.tags;
                    }
                }
            });
    
            editAttachmentModalInstance.result.then(function (attachment) {
                Attachment.update({ id: attachment.id }, attachment).$promise.then(
                    function(response){
                        console.log(response);
                        $scope.attachments[index] = response["attachment"];
                    },
                    function(){
                        alert("fail to update attachment");
                    }
                );
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        },
        "removeUnusedRow": function(index, attachment){
            if(attachment.id == -1){
                $scope.attachments.splice(index, 1);
            }
        }
    };

    
});

    
app.controller("EditAttachmentModalController", function ($scope, $uibModalInstance, attachment, tags) {
    $scope.attachment = _.clone(attachment);

    var tagInfo = {
        "tags": tags,
        "selectedTags": [],
        "toggleSelection": function(id){
            var index = this.selectedTags.indexOf(id);
            if(index > -1){
                this.selectedTags.splice(index, 1)
            }
            else{
                this.selectedTags.push(id);
            }
        }
    };
    tagInfo.selectedTags = _.map(attachment.tags, function(tag){ return tag.id; });
    $scope.tagInfo = tagInfo;
    
    $scope.save = function () {
        $scope.attachment.tags = $scope.tagInfo.selectedTags;
        $uibModalInstance.close($scope.attachment);
    };
    
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});    
