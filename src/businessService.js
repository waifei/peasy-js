var Command = require('./command');

var BusinessService = (function() {

  "use strict";

  // BUSINESS SERVICE

  var BusinessService = function(dataProxy) {
    if (this instanceof BusinessService) {
      this.dataProxy = dataProxy;
    } else {
      return new BusinessService(dataProxy);
    }
  };

  BusinessService.prototype = {

    getAllCommand: function() {
      var service = this;
      return new Command({
        _onInitialization: function(context, done) {
          service._onGetAllCommandInitialization(context, done);
        },
        _getRules: function(context, done) {
          return service._getRulesForGetAll(context, done);
        },
        _onValidationSuccess: function(context, done) {
          return service._getAll(context, done);
        }
      });
    },

    getByIdCommand: function(id) {
      var service = this;
      return new Command({
        _onInitialization: function(context, done) {
          service._onGetByIdCommandInitialization(id, context, done);
        },
        _getRules: function(context, done) {
          return service._getRulesForGetById(id, context, done);
        },
        _onValidationSuccess: function(context, done) {
          return service._getById(id, context, done);
        }
      });
    },

    insertCommand: function(data) {
      var service = this;
      return new Command({
        _onInitialization: function(context, done) {
          service._onInsertCommandInitialization(data, context, done);
        },
        _getRules: function(context, done) {
          return service._getRulesForInsert(data, context, done);
        },
        _onValidationSuccess: function(context, done) {
          return service._insert(data, context, done);
        }
      });
    },

    updateCommand: function(data) {
      var service = this;
      return new Command({
        _onInitialization: function(context, done) {
          service._onUpdateCommandInitialization(data, context, done);
        },
        _getRules: function(context, done) {
          return service._getRulesForUpdate(data, context, done);
        },
        _onValidationSuccess: function(context, done) {
          return service._update(data, context, done);
        }
      });
    },

    destroyCommand: function(id) {
      var service = this;
      return new Command({
        _onInitialization: function(context, done) {
          service._onDestroyCommandInitialization(id, context, done);
        },
        _getRules: function(context, done) {
          return service._getRulesForDestroy(id, context, done);
        },
        _onValidationSuccess: function(context, done) {
          return service._destroy(id, context, done);
        }
      });
    },

    _getAll: function(context, done) {
      this.dataProxy.getAll(done);
    },

    _getRulesForGetAll: function(context, done) {
      done(null, []);
    },

    _onGetAllCommandInitialization: function(context, done) {
      done();
    },

    _getById: function(id, context, done) {
      this.dataProxy.getById(id, done);
    },

    _getRulesForGetById: function(id, context, done) {
      done(null, []);
    },

    _onGetByIdCommandInitialization: function(id, context, done) {
      done();
    },

    _insert: function(data, context, done) {
      this.dataProxy.insert(data, done);
    },

    _getRulesForInsert: function(data, context, done) {
      done(null, []);
    },

    _onInsertCommandInitialization: function(data, context, done) {
      done();
    },

    _update: function(data, context, done) {
      this.dataProxy.update(data, done);
    },

    _getRulesForUpdate: function(data, context, done) {
      done(null, []);
    },

    _onUpdateCommandInitialization: function(data, context, done) {
      done();
    },

    _destroy: function(id, context, done) {
      this.dataProxy.destroy(id, done);
    },

    _getRulesForDestroy: function(id, context, done) {
      done(null, []);
    },

    _onDestroyCommandInitialization: function(id, context, done) {
      done();
    }
  };

  BusinessService.extend = function(options) {

    options = options || {};
    options.params = options.params || ['dataProxy'];
    options.functions = options.functions || {};

    var Extended = function() {
      this.arguments = arguments;
      var self = this;
      BusinessService.call(this);
      options.params.forEach(function(field, index) {
        self[field] = self.arguments[index];
      });
    };

    Extended.prototype = new BusinessService();
    var keys = Object.keys(BusinessService.prototype);
    Object.keys(options.functions).forEach(function(key) {
      if (keys.indexOf(key) === -1) {
        console.warn("The method: '" + key + "' is not an overridable method of BusinessService");
      }
      Extended.prototype[key] = options.functions[key];
    });

    function createCommand(options) {
      options = options || {};
      options.service = Extended;
      BusinessService.createCommand(options);
      return {
        createCommand: createCommand,
        service: Extended
      };
    }

    return {
      createCommand: createCommand,
      service: Extended
    };
  };

  BusinessService.createCommand = function(options) {

    function capitalize(value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }

    options = options || {};

    if (!options.name) {
      throw new Error('A value for name must be supplied');
    }

    if (!options.service) {
      throw new Error('A function for the service argument must be supplied');
    }

    var name = options.name;
    var onInitialization = '_on' + capitalize(name) + 'Initialization';
    var getRules = '_getRulesFor' + capitalize(name);
    var onValidationSuccess = '_' + name.replace("Command", "");
    var commandParams = '_' + name + 'Params';
    var functions = options.functions || {};
    var service = options.service;

    service.prototype[onInitialization] = functions._onInitialization || function(context, done) {
      done();
    };

    service.prototype[getRules] = functions._getRules || function(context, done) {
      done(null, []);
    };

    service.prototype[onValidationSuccess] = functions._onValidationSuccess || function(context, done) {
      done();
    };

    service.prototype[commandParams] = options.params || [];

    service.prototype[name] = function() {
      var self = this;
      self.arguments = arguments;

      self[commandParams].forEach(function(param, index) {
        self[param] = self.arguments[index];
      });

      return new Command({
        _onInitialization: function(context, done) {
          self[onInitialization].call(self, context, done);
        },
        _getRules: function(context, done) {
          return self[getRules].call(self, context, done);
        },
        _onValidationSuccess: function(context, done) {
          return self[onValidationSuccess].call(self, context, done);
        }
      });
    };

    return service;
  };

  Object.defineProperty(BusinessService.prototype, "constructor", {
    enumerable: false,
    value: BusinessService
  });

  return BusinessService;

})();

module.exports = BusinessService;
