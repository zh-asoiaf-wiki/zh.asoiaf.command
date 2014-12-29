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
      wiki.tryBot(function() {
        var pcat = {
          action: 'query', 
          generator: 'categorymembers', 
          gcmtitle: 'Category:' + subcat, 
          gcmlimit: '5000', 
          prop: 'categories', 
          cllimit: '5000', 
          clcategories: 'Category:' + cat
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
                  prop: 'revisions', 
                  rvprop: 'content'
                };
                wiki.client.api.call(pcontent, function(info, next, data) {
                  if (data) {
                    var pages = data.query.pages;
                    for (var id in pages) {
                      var content = pages[id].revisions[0]['*'];
                      content = content.replace('\n[[Category:' + cat + ']]', '');
                      var summary = 'zh.asoiaf.command.hierarchy: [[:Category:' + cat + ']] => [[:Category:' + subcat + ']]';
                      that.push(pages[id].title, content, summary);
                    }
                  }
                });
              }
            }
          }
        });
      });
    }, 
    push: function(title, content, summary, callback) {
      wiki.client.edit(title, content, summary, function(res) {
        console.log(res);
        if (callback) {
          callback();
        }
      });
    }
  };

  return command;
}());