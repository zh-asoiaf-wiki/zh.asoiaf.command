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
      var params = {
        action: 'query', 
        generator: 'categorymembers', 
        gcmtitle: 'Category:' + subcat, 
        gcmlimit: '5000', 
        prop: 'categories', 
        cllimit: '5000', 
        clcategories: 'Category:' + cat
      };
      wiki.client.api.call(params, function(info, next, data) {
        if (data) {
          var pages = data.query.pages;
          for (var id in pages) {
            console.log(id);
            console.log(pages[id]);
          }
        }
      });
    }
  };

  return command;
}());