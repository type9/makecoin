App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('CheeseTouch.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var TouchArtifact = data;
      App.contracts.Touch = TruffleContract(TouchArtifact);
    
      // Set the provider for our contract
      App.contracts.Touch.setProvider(App.web3Provider);
      App.checkHolder();
      return App.bindEvents();
    });
  },

  bindEvents: function() {
    $(document).on('click', '.selftouch-btn', App.handleTouch);
    $(document).on('click', '.touchsomeone-btn', App.handleTouch);
  },

  checkHolder: function() {
    var touchInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if(error){
        console.log(error);
      }

      var account = accounts[0]
      App.contracts.Touch.deployed().then(function(instance) {
        touchInstance = instance;
        return touchInstance.getTouchHolder.call();
      }).then(function (touchHolder) {
        if(account === touchHolder){
          console.log("You have the Cheese Touch.")
          $('#touch-declare').text("You have the Cheese Touch")
          $('#touch-interface').append(`
            <div class="form-group">
              <label for="addressInput">Touch Someone</label>
              <input type="text" class="form-control" id="addressInput" placeholder="Target address">
              <button type="submit" class="btn btn-primary touchsomeone-btn">Touch!</button>
            </div>
          `)
        } else if(touchHolder !== "0x0000000000000000000000000000000000000000"){
          console.log("You don't have the Cheese Touch, " + touchHolder + " has it.")
          $('#touch-declare').text(touchHolder + " has the Cheese Touch.")
          $('#touch-interface').append(`
            <button type="button" class="btn btn-warning disabled">Only Toucher can Transfer Touch</button>
          `)
        } else {
          console.log("No one has been touched yet.")
          $('#touch-declare').text("No one has been touched yet.")
          $('#touch-interface').append(`
            <button id="selftouch-btn" type="button" class="btn btn-info selftouch-btn">Touch Myself</button>
          `)
        }
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleTouch: function() {
    var touchInstance;

    let target = null;
    if($('#addressInput').val()){
      target = $('#addressInput').val();
    }

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      App.contracts.Touch.deployed().then(function(instance) {
        touchInstance = instance;
        console.log('handling touch');
        if(target == null){ // If transfer target is empty then we start a new touch
          console.log('starting new touch with ' + accounts[0]);
          return touchInstance.startTouch({from: accounts[0]});
        } else {
          console.log('transfering touch to ' + target);
          return touchInstance.transfer(target); // execute transfer
        }
      }).then(function(result) {
        console.log(result)
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
