/*
 * Copyright 2011 Adobe Systems Incorporated. All Rights Reserved.
 */
  
 /**
 * WorkingSetView generates the UI for the list of the files user is editing based on the model provided by EditorManager.
 * The UI allows the user to see what files are open/dirty and allows them to close editors and specify the current editor.
 */
define(function(require, exports, module) {
     
    // Load dependent modules
    var DocumentManager     = require("DocumentManager")
    , CommandManager        = require("CommandManager")
    , Commands              = require("Commands")
    , EditorManager        = require("EditorManager")
    , NativeFileSystem    = require("NativeFileSystem").NativeFileSystem
    ;
 
    // Initialize: register listeners
    $(DocumentManager).on("currentDocumentChange", function(event) {
        console.log("Current document changed!  --> "+DocumentManager.getCurrentDocument());
         
        _handleDocumentChanged();
    });
     
    $(DocumentManager).on("workingSetAdd", function(event, addedDoc) {
        //console.log("Working set ++ " + addedDoc);
        //console.log("  set: " + DocumentManager.getWorkingSet().join());
         
        _handleDocumentAdded( addedDoc )    
    });
     
    $(DocumentManager).on("workingSetRemove", function(event, removedDoc) {
        console.log("Working set -- " + removedDoc);
        //console.log("  set: " + DocumentManager.getWorkingSet().join());
         
            umentRemoved( removedDoc );
    });
     
    $(DocumentManager).on("dirtyFlagChange", function(event, doc ) {
        console.log("Dirty flag change: " + doc);
         
        _handleDirtyFlagChanged( doc );
    });
     
 
    /** Each list item in the working set stores a references to the related document in the list item's data.  
     *  Use listIem.data( _DOCUMENT_KEY ) to get the document reference
     */
    var _DOCUMENT_KEY = "document";
     
    /** Adds a document to the list in the same order it appears in the dat model
     * TODO Ty: only insert at end of list right now. Make order sensitive
     * @private
     * @param {!Document} doc 
     */
    function _handleDocumentAdded(doc) {
        var curDoc = DocumentManager.getCurrentDocument();
         
        // Add new item to bottom of list
        var link = $("<a></a>").attr("href", "#").text(doc.file.name);
        var newItem = $("<li></li>").append(link);
         
        // TODO: Ask NJ which way is better
        //var newItem = $("<li class='working-set-list-item'><a href='#'>" + doc.file.name +  "</a></li>");
         
        // Link the list item with the document data
        newItem.data( _DOCUMENT_KEY, doc );
         
        $("#open-files-container").children("ul").append(newItem);
         
        // Update the listItem's apperance
        _updateFileStatusIcon(newItem, doc.isDirty, false);
        _updateListItemSelection(newItem, curDoc);
         
        // Click handler
        newItem.click( function() { 
            _openDoc( doc );
        });
         
        // Hover handler        
        newItem.hover(
            // hover in
            function() { _updateFileStatusIcon($(this), doc.isDirty, true); },
            // hover out
            function() { _updateFileStatusIcon($(this), doc.isDirty, false);}
        );
    }
     
    /** Updates the appearance of the list element based on the parameters provided
     * @private
     * @param {!HTMLLIElement} listElement
     * @param {bool} isDirty 
     * @param {bool} canClose
     */
    function _updateFileStatusIcon(listElement, isDirty, canClose) {
       var found = listElement.find(".file-status-icon");
       var fileStatusIcon = found.length != 0 ? $(found[0]) : null;
       var showIcon = isDirty || canClose;
 
       // remove icon if its not needed
       if (!showIcon && fileStatusIcon) {
           fileStatusIcon.remove();
           fileStatusIcon = null;
       } 
       // create icon if its needed and doesn't exist
       else if (showIcon && !fileStatusIcon) {
           fileStatusIcon = $("<div></div>");
           fileStatusIcon.addClass("file-status-icon");
           listElement.prepend(fileStatusIcon);
                
           fileStatusIcon.click( function() {
               var doc = listElement.data(_DOCUMENT_KEY)
               CommandManager.execute(Commands.FILE_CLOSE, doc);
           });
       }
 
       // Set icon's class
       if (fileStatusIcon) {
           fileStatusIcon.toggleClass("dirty", isDirty);
           fileStatusIcon.toggleClass("canClose", canClose);
       }
   }
    
 
   function _handleDocumentChanged(){
       _updateListSelection( DocumentManager.getCurrentDocument() );
   }
    
 
   function _updateListSelection(curDoc){
       // Iterate through working set list and update the selection on each
       if(curDoc){
           var items = $("#open-files-container").children("ul").children();
           items.each( function(i){
               var listItem = $(this);
                
               _updateListItemSelection(listItem, curDoc);
           }); 
       }
   }
    
   /** Updates the appearance of the list element based on the parameters provided.
    * @private
    * @param {HTMLLIElement} listElement
    * @param {Document} curDoc 
    */
   function _updateListItemSelection(listItem, curDoc){
       if(listItem.data(_DOCUMENT_KEY ) === curDoc)
           listItem.addClass("selected");
        else
           listItem.removeClass("selected");
   }
    
   function _openDoc(doc) {
       CommandManager.execute(Commands.FILE_OPEN, doc.file.fullPath);
    }
       
   function _closeDoc(doc) {
       CommandManager.execute(Commands.FILE_CLOSE, doc.file.fullPath);
   }
        
        
   /** Finds the listItem item assocated with the doc. Returns null if not found.
    * @private
    * @param {Document} curDoc 
    * @return {HTMLLIItem}
    */
   function _findListItemFromDocument(doc) {
       var result = null;
        
       if(doc){
           var items = $("#open-files-container").children("ul").children();
           items.each( function(i){
               var listItem = $(this);
               if(listItem.data( _DOCUMENT_KEY ) === doc){
                   result = listItem;
                   return false; // breaks each
               }
           }); 
       }
        
       return null;      
   }
     
    function _handleDocumentRemoved(doc) {        
        var listItem = _findListItemFromDocument(doc);
        if(listItem){
            listItem.remove();
        }
    }
     
    function _handleDirtyFlagChanged(doc){
        $("#" + doc.file.fullPath).find(".file-status-icon");
    }
     
    function _rebuild() {
     
    }
     
});
