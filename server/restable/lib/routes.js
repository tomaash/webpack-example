var generateRoutes;
var pluralize = require('pluralize');
var koaRouter = require('koa-router');
var clone = require('lodash').clone;
    // bodyParser = require('koa-body-parser');

module.exports = generateRoutes = function(app, modelName, actions, prefix) {
  if (prefix == null) {
    prefix = '';
  }
  modelName = pluralize(modelName);

  // app.use(bodyParser());
  var router = koaRouter();

  router.queryInterceptor = function(cb) {
    router.use(function*(next){
      if (this.request.method === "GET") {
        this.request.query = cb(this, this.request.query)
        console.log("query interceptor query:");
        console.log(this.request.query);
      }
      yield next;
    })
  }

  router.conditionsInterceptor = function(cb) {
    router.use(function*(next){
      if (this.request.method === "GET") {
        var conditions;
        var query = clone(this.request.query);
        try {
          conditions = (query.conditions && JSON.parse(query.conditions)) || {};
        } catch (err) {
          console.error(err);
          conditions = {};
        }

        conditions = cb(this, conditions)

        query.conditions = JSON.stringify(conditions);
        this.request.query = query;
        console.log("conditions interceptor query:");
        console.log(this.request.query);
      }
      yield next;
    })
  }

  router.mount = function() {
    router.get(prefix + ("/" + modelName), actions.findAll);
    router.get(prefix + ("/" + modelName + "/:id"), actions.findById);
    router.post(prefix + ("/" + modelName), actions.create);
    router.post(prefix + ("/" + modelName + "/:id"), actions.updateById);
    router.del(prefix + ("/" + modelName + "/:id"), actions.deleteById);
    router.put(prefix + ("/" + modelName), actions.create);
    router.put(prefix + ("/" + modelName + "/:id"), actions.replaceById);
    router.patch(prefix + ("/" + modelName + "/:id"), actions.updateById);
    app
     .use(router.routes())
     .use(router.allowedMethods());
  }

  return router;
};