/*jslint indent: 2 */
/*global $: false, document: false, togglbutton: false, window: false*/
'use strict';

if(verifyLogin()) {
  // Single task/issue/project in main view
  togglbutton.render('#layout-container:not(.toggl)', {observe: true}, function (elem) {
    var link,
      t_container,
      navgroup,
      description = function () {
        var w_name = $('.detail-name-edit', elem).textContent;

        return w_name + ' ' + window.location.href;
      };

    link = togglbutton.createTimerLink({
      className: 'workfront',
      description: description
    });

    // Create container element
    t_container = document.createElement("li");
    t_container.id = "nav-toggl";
    t_container.className = "navbar-item";
    t_container.setAttribute("style", "height: 62px; vertical-align: middle;");

    // Add Toggl button to container
    t_container.appendChild(link);

    // Add container to navbar
    navgroup = document.querySelector('.navbar-item-group.right');
    navgroup.insertBefore(t_container, navgroup.children[0]);
  });

  // Multiple tasks in project view
  var t = document.querySelector("#minified-scripts").innerHTML;
  var user_name = /\/user\/view.*?label:\"(.*?)\"/.exec(t)[1];
  var myTasks = document.querySelectorAll(`td[data-workvalue*="${user_name}"]`);

  myTasks.forEach(function(e){
    var objid = e.parentElement.getAttribute('objid');
    var taskName = e.parentElement.querySelector('td[valuefield=name]');
    var l = taskName.querySelector('.objectlink');
    var url = l.href;
    var name = l.innerText;
    if(url.length>30 && name.length>3){
      togglbutton.render(`[objid="${objid}"]:not(.toggl)`, {observe: true}, function (elem) {
        var link;
        var taskName = elem.querySelector('td[valuefield=name]');
        var l = taskName.querySelector('.objectlink');
        var url = l.href;
        var name = l.innerText;
        var description = function () {
            return name + ' ' + url;
          };

        link = togglbutton.createTimerLink({
          className: 'workfront',
          description: description,
          buttonType: 'minimal'
        });

        // Add Toggl button to container
        var nameDiv = taskName.querySelector('div');
        var nameDivSpan = nameDiv.querySelector('span');
        nameDiv.insertBefore(link, nameDivSpan);
      });
    }
  });
}

function verifyLogin() {
  if(workfrontApiKeyIsValid() && !isLoginPage()) return true;

  // Grab credentials
  if(isLoginPage()) {
    var btn_login = document.querySelector('form[name=loginForm] button[type=submit]');
      btn_login.addEventListener('click', function(e){
        var user = document.querySelector('form[name=loginForm] #username').value,
        password = document.querySelector('form[name=loginForm] #password').value;
        if(workfrontApiKeyIsInvalid()) {
          e.preventDefault();
          btn_login.innerHTML = 'Logging In';
          btn_login.disabled = true;
          getWorkfrontApiKey(user, password);
        }
        else {
          // Do nothing
        }
      });
     }
  else {
    if(workfrontApiKeyIsInvalid()) {
      window.location.href = '/login';
    }
  }
}

function getWorkfrontApiKey(user, password) {
  var apiSuffix = '/attask/api/v5.0';
  var loginUrl = 'https://' + window.location.hostname + apiSuffix + '/login';

  XHR('POST', loginUrl, 'username=' + user + '&password=' + password, function(res){

          if(typeof res.data.sessionID === 'string') {
            localStorage.workfrontSessionID = res.data.sessionID;

            var getApiKeyUrl = 'https://' + window.location.hostname + apiSuffix + '/user?action=getApiKey&sessionID=' + localStorage.workfrontSessionID;
  
            XHR('PUT', getApiKeyUrl, 'sessionID=' + localStorage.workfrontSessionID, function(res){
                  if(typeof res.data.result === 'string') {
                    localStorage.workfrontApiKey = res.data.result;
                    if(workfrontApiKeyIsValid()) {
                        document.querySelector('form[name=loginForm]').submit();
                    }                  
                  }
                  else {
                    var createApiKeyUrl = 'https://' + window.location.hostname + apiSuffix + '/user?action=generateApiKey&sessionID=' + localStorage.workfrontSessionID;
                    XHR('PUT', createApiKeyUrl, 'sessionID=' + localStorage.workfrontSessionID, function(res){
                      if(typeof res.data.result === 'string') {
                        localStorage.workfrontApiKey = res.data.result;
                        if(workfrontApiKeyIsValid()) {
                          document.querySelector('form[name=loginForm]').submit();
                        }
                      }
                      else {
                        console.error('Could not generate Workfront token.');
                      }
                    });
                  }
                });
          }
          else {
            console.error('Could not log in to Workfront. Please check your credentials and internet connection.');
          }
  });
}


function workfrontApiKeyIsValid() {
 return !workfrontApiKeyIsInvalid();
}
function workfrontApiKeyIsInvalid() {
  return typeof localStorage.workfrontApiKey !== 'string' || localStorage.workfrontApiKey.length!=32;
}
function isLoginPage() {
  return /\.com\/login($|\?)/.test(window.location);
}



function XHR(method, url, payload, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);

  //Send the proper header information along with the request
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhr.onreadystatechange = function() {//Call a function when the state changes.
    if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
      cb(JSON.parse(xhr.response));
    }
  }
  xhr.send(payload);
}
