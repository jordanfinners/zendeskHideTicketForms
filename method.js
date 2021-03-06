	const newRequestUrl = "https://MYCOMPANY.zendesk.com/hc/en-us/requests/new"
      // generic function to push users without an organisation or forms for that organisation to a default template
      function pushToDefaultForm() {
          const defaultformurl = `${newRequestUrl}?ticket_form_id=DEFAULTTICKETID`;
          if (!window.location.toString().includes(defaultformurl)) {
              // Redirect to Default Form
              window.location = defaultformurl;
          }
          hideFormDropdown();
      }
      
      // generic function to hide the dropdown if only one option
      function hideFormDropdown(){
        $(".request_ticket_form_id").hide();
      }

      //if user has no organisation, show the default form
      if (HelpCenter.user.organizations.length === 0) {
          pushToDefaultForm();
      } else {
          // Loop over the organisations a user belongs to building up a list of all the tags (form ids) they can see
          const organisationForms = []
          HelpCenter.user.organizations.forEach(function (organization) {
              organization.tags.forEach(function (tag) {
                  organisationForms.push(tag);
              });
          });
          // if a user has organisations but no form ids associated, panic and push them to the default form
          if (organisationForms.length === 0) {
              // Redirect to Default Form
              pushToDefaultForm();
          } else {
              // keep checking the dropdown exists every 100ms until it does
              let checkExist = setInterval(function () {
                  if ($("a.nesty-input").length) {
                      clearInterval(checkExist);
                      $("a.nesty-input").each(function () {
                          // get the all the possible form options (for everyone not just this user) 
                          const options = document
                          				  .getElementById("request_issue_type_select")
                          				  .getElementsByTagName("option");
                          const optionsToRemove = [];
                        	const optionsAvaliable = [];
                          // loop over the options backwards (so as not to affect the list),
                          // removing the options the user shouldn't be able to see
                          for (var i = options.length - 1; i > 0; i--) {
                              let value = options[i].value;
                              // check if the form id for this option is one the user can see
                              const userHasForm = organisationForms.findIndex(function (id) {
                                  return value === id;
                              }) > -1;
                              // if the user cannot see the form store it in a list of ids
                              // the user cannot see and remove that option
                              if (!userHasForm) {
                                  optionsToRemove.push(value);
                                  $(`option[value='${value}']`).each(function () {
                                      $(this).remove();
                                  });
                              } else {
                                	optionsAvaliable.push(value)
                              }
                          }
                        	if (optionsAvaliable.length === 1){
                            	const formurl = `${newRequestUrl}?ticket_form_id=${optionsAvaliable[0]}`;
                              if (!window.location.toString().includes(formurl)) {
                                  // Redirect to Default Form
                                  window.location = formurl;
                              }
                            	hideFormDropdown();
                          }
                          // every time the user clicks a weird popup happens with a list of options,
                          // this needs removing down to only those the user can see each time they click,
                          // so use the stored list of options to remove loop over these
                          // removing each one
                          $(this).bind("click", function () {
                              optionsToRemove.forEach(function (id) {
                                  $((`#${id}`)).remove();
                              });
                          });
                      })
                  }
              }, 100);
          }
      }
