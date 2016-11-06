/*jslint indent: 2 */
/*global $: false, document: false, togglbutton: false, window: false*/
'use strict';

setTimeout(function(){
  togglbutton.render('#rootDiv:not(.toggl)', {observe: true}, function (elem) {
    var link,
      t_container,
      description = function () {
        var t_name = document.getElementById("tbSectionTitle").textContent;
        return t_name;
      };

    link = togglbutton.createTimerLink({
      className: 'testout',
      description: description
    });

    // Replace task description with a generic 'Start timer'
    // This is required because the link title does not change when the chapter changes, leaving the older chapter name in the title attribute
    link.title = 'Toggl timer';

    // Get container element
    t_container = document.getElementById("StackPanel");
    
    // Add Toggl button to container
    t_container.appendChild(link);

  });
},10000);