module.exports = (function() {
  var _ = require('lodash');
  var Wiki = require('zh.asoiaf.utility').Wiki;
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
  
  var Command = function() {
  };
  
  Command.prototype = {
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
          if (info) {
            var pages = info.pages;
            _(pages)
              .filter('categories') // need to correct hierarchy
              .forEach(function(page) {
                var pcontent = {
                  action: 'query', 
                  titles: page.title, 
                  prop: 'revisions|categories',
                  rvprop: 'content|timestamp',
                  clcategories: csubcat, 
                  clprop: 'sortkey'
                };
                wiki.client.api.call(pcontent, function(info, next, data) {
                  if (info) {
                    var pages = info.pages;
                    _(pages)
                      .reject(function(page) { 
                        return page.categories[0]['sortkeyprefix'] === '*'; 
                      })
                      .forEach(function(page) {
                        var content = page.revisions[0]['*'];
                        var reg = '\\n\\[\\[' + ccat + '\\|?[^\\]]*\\]\\]';
                        var regex = new RegExp(reg);
                        content = content.replace(regex, '');
                        var summary = 'zh.asoiaf.command.hierarchy: [[:Category:' + cat + ']] => [[:Category:' + subcat + ']]';
                        var pedit = {
                          action: 'edit', 
                          title: page.title, 
                          text: content, 
                          summary: summary, 
                          bot: 'true', 
                          basetimestamp: page.revisions[0]['timestamp']
                        };
                        that.edit(pedit);                        
                      });
                  }
                });
              });
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
          if (info) {
            console.log(info);
            callback && callback(info);
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
        callback && callback();
      });
    }, 
  };

  return Command;
}());