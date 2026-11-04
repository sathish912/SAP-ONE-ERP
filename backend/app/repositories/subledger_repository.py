from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.subledger import APInvoice, ARInvoice, FixedAsset, Budget, GSTRecord
from ..schemas.subledger import (
    APInvoiceCreate, ARInvoiceCreate, FixedAssetCreate, BudgetCreate, GSTRecordCreate
)


class SubledgerRepository:
    def __init__(self, db: Session):
        self.db = db

    # ================= Accounts Payable (AP) =================
    def list_ap_invoices(self, company_id: int) -> List[APInvoice]:
        return self.db.query(APInvoice).filter(APInvoice.company_id == company_id).order_by(APInvoice.ap_invoice_id.desc()).all()

    def create_ap_invoice(self, data: APInvoiceCreate) -> APInvoice:
        invoice = APInvoice(
            company_id=data.company_id,
            vendor_name=data.vendor_name,
            invoice_number=data.invoice_number,
            invoice_date=data.invoice_date,
            due_date=data.due_date,
            total_amount=data.total_amount,
            paid_amount=0.00,
            remaining_amount=data.total_amount,
            status="UNPAID",
        )
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def record_ap_payment(self, ap_invoice_id: int, payment_amount: Decimal) -> Optional[APInvoice]:
        invoice = self.db.query(APInvoice).filter(APInvoice.ap_invoice_id == ap_invoice_id).first()
        if not invoice:
            return None

        invoice.paid_amount = float(invoice.paid_amount or 0.0) + float(payment_amount)
        invoice.remaining_amount = max(0.0, float(invoice.total_amount) - float(invoice.paid_amount))

        if invoice.remaining_amount <= 0.001:
            invoice.status = "PAID"
        else:
            invoice.status = "PARTIAL"

        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    # ================= Accounts Receivable (AR) =================
    def list_ar_invoices(self, company_id: int) -> List[ARInvoice]:
        return self.db.query(ARInvoice).filter(ARInvoice.company_id == company_id).order_by(ARInvoice.ar_invoice_id.desc()).all()

    def create_ar_invoice(self, data: ARInvoiceCreate) -> ARInvoice:
        invoice = ARInvoice(
            company_id=data.company_id,
            customer_name=data.customer_name,
            invoice_number=data.invoice_number,
            invoice_date=data.invoice_date,
            due_date=data.due_date,
            total_amount=data.total_amount,
            received_amount=0.00,
            remaining_amount=data.total_amount,
            status="UNPAID",
        )
        self.db.add(invoice)
        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    def record_ar_payment(self, ar_invoice_id: int, receipt_amount: Decimal) -> Optional[ARInvoice]:
        invoice = self.db.query(ARInvoice).filter(ARInvoice.ar_invoice_id == ar_invoice_id).first()
        if not invoice:
            return None

        invoice.received_amount = float(invoice.received_amount or 0.0) + float(receipt_amount)
        invoice.remaining_amount = max(0.0, float(invoice.total_amount) - float(invoice.received_amount))

        if invoice.remaining_amount <= 0.001:
            invoice.status = "PAID"
        else:
            invoice.status = "PARTIAL"

        self.db.commit()
        self.db.refresh(invoice)
        return invoice

    # ================= Fixed Assets =================
    def list_assets(self, company_id: int) -> List[FixedAsset]:
        return self.db.query(FixedAsset).filter(FixedAsset.company_id == company_id).all()

    def create_asset(self, data: FixedAssetCreate) -> FixedAsset:
        asset = FixedAsset(
            company_id=data.company_id,
            asset_code=data.asset_code,
            asset_name=data.asset_name,
            category=data.category,
            purchase_date=data.purchase_date,
            purchase_cost=data.purchase_cost,
            accumulated_depreciation=0.00,
            current_net_value=data.purchase_cost,
            status="ACTIVE",
        )
        self.db.add(asset)
        self.db.commit()
        self.db.refresh(asset)
        return asset

    def record_depreciation(self, asset_id: int, depreciation_amount: Decimal) -> Optional[FixedAsset]:
        asset = self.db.query(FixedAsset).filter(FixedAsset.asset_id == asset_id).first()
        if not asset:
            return None

        asset.accumulated_depreciation = float(asset.accumulated_depreciation or 0.0) + float(depreciation_amount)
        asset.current_net_value = max(0.0, float(asset.purchase_cost) - float(asset.accumulated_depreciation))
        self.db.commit()
        self.db.refresh(asset)
        return asset

    # ================= Budgeting =================
    def list_budgets(self, company_id: int, fiscal_year_id: Optional[int] = None) -> List[Budget]:
        query = self.db.query(Budget).filter(Budget.company_id == company_id)
        if fiscal_year_id:
            query = query.filter(Budget.fiscal_year_id == fiscal_year_id)
        return query.all()

    def create_or_update_budget(self, data: BudgetCreate) -> Budget:
        budget = (
            self.db.query(Budget)
            .filter(
                Budget.company_id == data.company_id,
                Budget.fiscal_year_id == data.fiscal_year_id,
                Budget.account_id == data.account_id,
            )
            .first()
        )
        if budget:
            budget.budgeted_amount = data.budgeted_amount
        else:
            budget = Budget(
                company_id=data.company_id,
                fiscal_year_id=data.fiscal_year_id,
                account_id=data.account_id,
                budgeted_amount=data.budgeted_amount,
                actual_amount=0.00,
            )
            self.db.add(budget)

        self.db.commit()
        self.db.refresh(budget)
        return budget

    # ================= GST Records =================
    def list_gst_records(self, company_id: int) -> List[GSTRecord]:
        return self.db.query(GSTRecord).filter(GSTRecord.company_id == company_id).order_by(GSTRecord.gst_id.desc()).all()

    def create_gst_record(self, data: GSTRecordCreate) -> GSTRecord:
        taxable = float(data.taxable_value)
        cgst = taxable * float(data.cgst_rate_percent) / 100.0
        sgst = taxable * float(data.sgst_rate_percent) / 100.0
        igst = taxable * float(data.igst_rate_percent) / 100.0
        total_tax = cgst + sgst + igst

        gst = GSTRecord(
            company_id=data.company_id,
            transaction_ref=data.transaction_ref,
            hsn_sac=data.hsn_sac,
            taxable_value=data.taxable_value,
            cgst_amount=cgst,
            sgst_amount=sgst,
            igst_amount=igst,
            total_tax=total_tax,
        )
        self.db.add(gst)
        self.db.commit()
        self.db.refresh(gst)
        return gst

