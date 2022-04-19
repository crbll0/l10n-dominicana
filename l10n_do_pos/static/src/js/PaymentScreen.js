odoo.define('l10n_do_pos.PaymentScreen', function(require) {
	'use strict';

	const PaymentScreen = require('point_of_sale.PaymentScreen');
	const Registries = require('point_of_sale.Registries');
	const session = require('web.session');
	var models = require('point_of_sale.models');
    var rpc = require('web.rpc');
    var core = require('web.core');
    const { Gui } = require('point_of_sale.Gui');
    var _t = core._t;

	const BiPaymentScreen = PaymentScreen => 
		class extends PaymentScreen {
			async _finalizeValidation() {
	        	var self = this;
                var current_order = this.currentOrder;
                if (current_order.to_invoice_backend &&
	                self.env.pos.invoice_journal.l10n_latam_use_documents &&
	                !current_order.l10n_latam_document_number) {
                		var latam_sequence =
		                    self.env.pos.get_l10n_latam_sequence_by_document_type_id(
		                        current_order.l10n_latam_document_type.id
		                    );
		                self.env.pos.loading_screen_on();
		                if (!latam_sequence){
		                	var error_b = 'Please Create Sequence for ['+ current_order.l10n_latam_document_type.name+'] Document Type !';
		                    Gui.showPopup('ErrorPopup',{
		                        'title': _t('Error: Not found document type sequence !'),
		                        'body':  _t(error_b),
		                    });
		                    return false;
		                }
		                await rpc.query({
		                    model: 'ir.sequence',
		                    method: 'next_by_id',
		                    args: [latam_sequence.id],
		                }).then(function (res) {
		                    self.env.pos.loading_screen_off();
		                    current_order.l10n_latam_document_number = res;
		                    current_order.l10n_do_ncf_expiration_date = current_order.l10n_latam_document_type.l10n_do_ncf_expiration_date;
		                    current_order.l10n_latam_sequence_id = latam_sequence.id;
		                    current_order.l10n_latam_document_type_id =
		                        current_order.l10n_latam_document_type.id;
		                    current_order.save_to_db();
		                }, function (err) {
		                    self.env.pos.loading_screen_off();
		                    current_order.to_invoice = true;
		                    current_order.save_to_db();
		                    err.event.preventDefault();
		                    var error_body =
		                        _t('Your Internet connection is probably down.');
		                    if (err.message.data) {
		                        var except = err.message.data;
		                        error_body = except.message || except.arguments || error_body;
		                    }
		                    Gui.showPopup('ErrorPopup',{
		                        'title': _t('Error: Could not Save Changes !'),
		                        'body':  error_body,
		                    });
		                    return false;
		                });
		                await super._finalizeValidation();
	            }else{
	            	await super._finalizeValidation();
	            }

			}
		}

	Registries.Component.extend(PaymentScreen, BiPaymentScreen);

	return PaymentScreen;

});
