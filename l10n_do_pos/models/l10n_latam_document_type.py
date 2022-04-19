from odoo import models, fields, _


class L10nLatamDocumentType(models.Model):
    _inherit = "l10n_latam.document.type"

    def action_create_sequence(self):
        active_ids = self._context.get("active_ids")
        seq_obj = self.env['ir.sequence'].sudo()
        print("\n\n\n action_create_sequence ==================active_ids======",active_ids)
        for r in self.env['l10n_latam.document.type'].sudo().browse(active_ids):
            print("\n\n\n r==========",r)
            sequence_id = seq_obj.search([('l10n_latam_document_type_id','=',r.id)],limit=1)
            if not sequence_id:
                vals = {
                        'name': _('%s') % (r.name),
                        'code': '%s' % (r.name),
                        'implementation': 'no_gap',
                        'prefix': r.doc_code_prefix,
                        'suffix': '',
                        'padding': 8,
                        # 'company_id': r.company_id.id,
                        'l10n_latam_document_type_id': r.id}
                seq_obj.sudo().create(vals)
                
