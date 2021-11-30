from collections import defaultdict
from odoo import models, api
from odoo.exceptions import ValidationError


class AccountMove(models.Model):
    _inherit = "account.move"

    @api.depends('posted_before', 'state', 'journal_id', 'date')
    def _compute_name(self):
        l10n_do_move = self.filtered(lambda x: x.country_code == "DO" and x.l10n_latam_document_type_id
                and not x.l10n_latam_manual_document_number
                and not x.l10n_do_enable_first_sequence)

        others_move = self - l10n_do_move
        super(AccountMove, l10n_do_move.with_context(is_l10n_do_seq=True))._compute_name()
        super(AccountMove, others_move)._compute_name()

