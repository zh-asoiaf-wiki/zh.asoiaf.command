module.exports = (function() {
  var Wiki = require('./wiki.js');
  var wiki = new Wiki({
    config: {
      "server": "zh.asoiaf.wikia.com", 
      "path": "", 
      "username": process.env.BOT_USERNAME, 
      "password": process.env.BOT_PASSWORD, 
      "userAgent": "zh.asoiaf.command", 
      "debug": true
    }
  });
  
  var command = function() {
  };
  
  command.prototype = {
    hierarchy: function(cat, subcat) {
      var that = this;
      var ccat = 'Category:' + cat;
      var csubcat = 'Category:' + subcat;
      wiki.tryBot(function() {
        var pcat = {
          action: 'query', 
          generator: 'categorymembers', 
          gcmtitle: csubcat, 
          gcmlimit: '5000', 
          prop: 'categories', 
          cllimit: '5000', 
          clcategories: ccat
        };
        wiki.client.api.call(pcat, function(info, next, data) {
          if (data) {
            var pages = data.query.pages;
            for (var id in pages) {
              if (pages[id].categories) {
                // need to correct hierarchy
                var pcontent = {
                  action: 'query', 
                  titles: pages[id].title, 
                  prop: 'revisions|categories', 
                  rvprop: 'content|timestamp', // add timestamp to avoid bug
                  clcategories: csubcat, 
                  clprop: 'sortkey'
                };
                wiki.client.api.call(pcontent, function(info, next, data) {
                  if (data) {
                    var pages = data.query.pages;
                    for (var id in pages) {
                      var c = pages[id].categories[0]['sortkeyprefix'];
                      if (c == '*') {
                        continue;
                      } else {
                        var content = pages[id].revisions[0]['*'];
                        var reg = '\\n\\[\\[' + ccat + '\\|?[^\\]]*\\]\\]';
                        var regex = new RegExp(reg);
                        content = content.replace(regex, '');
                        var summary = 'zh.asoiaf.command.hierarchy: [[:Category:' + cat + ']] => [[:Category:' + subcat + ']]';
                        var pedit = {
                          action: 'edit', 
                          title: pages[id].title, 
                          text: content, 
                          summary: summary, 
                          bot: 'true', 
                          basetimestamp: pages[id].revisions[0]['timestamp']
                        };
                        that.edit(pedit);
                      }
                    }
                  }
                });              
              }
            }
          }
        });
      });
    }, 
    /*
     * Edit pages via direct-api-call
     * Customize your parameters for API
     */
    edit: function(params, callback) {
      wiki.client.getToken(params.title, 'edit', function(token) {
        params.token = token;
        wiki.client.api.call(params, function(info, next, data) {
          if (data) {
            console.log(data);
            callback && callback(data);
          }
        }, 'POST');
      });
    }, 
    /*
     * Simply use edit in nodemw
     * NOTICE: no guarantee this edit will base on the last revision of this page.
     */
    push: function(title, content, summary, callback) {
      wiki.client.edit(title, content, summary, function(res) {
        console.log(res);
        if (callback) {
          callback();
        }
      });
    }, 
  };

  return command;
}());