var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var moment = require('moment');

// Initialize jQuery & Underscore in BackBone
Backbone.$ = $;
window.$ = $;
window._ = _;
window.moment = moment;

var unknown = "unknown", fail = no = false, pass = yes = true, empty = "";

var access = require('./access');

var UI = {
	load:   require('./UI/load')
};
var Models = {
	Mail: require('./Models/Mail')
}
var Collections = {
	MailBox: require('./Collections/MailBox')
}
var Views = {
	Item	: require('./Views/Item'),
	Mail	: require('./Views/Mail'),
	Main	: require('./Views/Main'),
	Composer: require('./Views/Composer'),
	App		: require('./Views/App'),
}
var client = new Object;
var stats = {
	folder:  'inbox',
	page: 1,
	showing: 10,
	pages: 'unknown',
	total: 'unknown'
};

client.build = function(){
	var Mail = Models.Mail(Backbone);

	var MailBox = new (Collections.MailBox(Backbone, Mail));

	var Composer = Views.Composer(Backbone);

	var ItemView = Views.Item(Backbone);

	var MailView = Views.Mail(Backbone, Composer);

	var View = Views.Main(Backbone, MailBox, MailView, ItemView, UI);

	var App = Views.App(Backbone, MailBox, Composer, UI, access);

	this.Mail = Mail;
	this.MailBox = MailBox;
	this.ItemView = ItemView;
	this.View = new View;
	this.App = new App;
}

$(function(){
	function Launch(){
		$('#App').addClass('ready');
		window.API = new client.build();
	}

	var LoginInterface = $('#Login > form');
	var AccountInterface = $('#Account > div');

	// Show login page if access is not granted
	access.check(function(auth){
		if(auth !== true) LoginInterface.parent().removeClass('hidden');
		else Launch()
	})

	// Bind login functions
	LoginInterface.submit(function(event){
		event.preventDefault();

		var email = LoginInterface.find('#email').val()
		var password = LoginInterface.find('#password').val();

		access.request(email, password, function(auth){
			console.log(auth);
			LoginInterface.find("#password").val("");
			if(!!auth.success){
				LoginInterface.parent().removeClass('error').addClass('success');
				Launch()
				setTimeout(function(){
					LoginInterface.parent().addClass('hidden');
				}, 1000);
			}else{
				LoginInterface.parent().addClass('error');
				setTimeout(function(){
					LoginInterface.parent().removeClass('error');
				}, 10000);
			}
		})
	})
})
