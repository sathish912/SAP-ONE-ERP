from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from ..repositories.subledger_repository import SubledgerRepository
from ..models.subledger import APInvoice, ARInvoice, FixedAsset, Budget, GSTRecord
from ..schemas.subledger import (
    APInvoiceCreate, ARInvoiceCreate, FixedAssetCreate, BudgetCreate, GSTRecordCreate
)
from ..utils.exceptions import EntityNotFoundException, BusinessRuleException


class SubledgerService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = SubledgerRepository(db)

    # ================= Accounts Payable (AP) =================
    def list_ap(self, company_id: int) -> List[APInvoice]:
        return self.repo.list_ap_invoices(company_id)

    def create_ap(self, data: APInvoiceCreate) -> APInvoice:
        return self.repo.create_ap_invoice(data)

    def record_ap_payment(self, ap_invoice_id: int, amount: Decimal) -> APInvoice:
        invoice = self.repo.record_ap_payment(ap_invoice_id, amount)
        if not invoice:
            raise EntityNotFoundException("AP Invoice not found.")
        return invoice

    # ================= Accounts Receivable (AR) =================
    def list_ar(self, company_id: int) -> List[ARInvoice]:
        return self.repo.list_ar_invoices(company_id)

    def create_ar(self, data: ARInvoiceCreate) -> ARInvoice:
        return self.repo.create_ar_invoice(data)

    def record_ar_payment(self, ar_invoice_id: int, amount: Decimal) -> ARInvoice:
        invoice = self.repo.record_ar_payment(ar_invoice_id, amount)
        if not invoice:
            raise EntityNotFoundException("AR Invoice not found.")
        return invoice

    # ================= Fixed Assets =================
    def list_assets(self, company_id: int) -> List[FixedAsset]:
        return self.repo.list_assets(company_id)

    def create_asset(self, data: FixedAssetCreate) -> FixedAsset:
        return self.repo.create_asset(data)

    def record_depreciation(self, asset_id: int, amount: Decimal) -> FixedAsset:
        asset = self.repo.record_depreciation(asset_id, amount)
        if not asset:
            raise EntityNotFoundException("Fixed Asset not found.")
        return asset

    # ================= Budgeting =================
    def list_budgets(self, company_id: int, fiscal_year_id: Optional[int] = None) -> List[Budget]:
        return self.repo.list_budgets(company_id, fiscal_year_id)

    def set_budget(self, data: BudgetCreate) -> Budget:
        return self.repo.create_or_update_budget(data)

    # ================= GST =================
    def list_gst(self, company_id: int) -> List[GSTRecord]:
        return self.repo.list_gst_records(company_id)

    def record_gst(self, data: GSTRecordCreate) -> GSTRecord:
        return self.repo.create_gst_record(data)

    # ================= Sample Data Seeder =================
    def seed_sample_subledger_data(self, company_id: int) -> Dict[str, int]:
        """Seeds realistic demo data for AP, AR, Fixed Assets, Budgets, and GST for a company."""
        from datetime import date
        from ..models.account import Account
        from ..models.financial_year import FiscalYear
        from ..models.company import Company

        company = self.db.query(Company).filter(Company.company_id == company_id).first()
        if not company:
            raise EntityNotFoundException(f"Company {company_id} not found.")

        code = company.company_code
        cid = company.company_id

        # 1. Accounts & Fiscal Year
        accounts = self.db.query(Account).filter(Account.company_id == cid).all()
        acc_map = {a.account_code: a.account_id for a in accounts}

        fys = self.db.query(FiscalYear).filter(FiscalYear.company_id == cid).all()
        target_fy_id = fys[0].fiscal_year_id if fys else None

        counts = {"ap": 0, "ar": 0, "assets": 0, "budgets": 0, "gst": 0}

        # 2. AP Invoices
        if self.db.query(APInvoice).filter(APInvoice.company_id == cid).count() == 0:
            ap_list = [
                APInvoice(
                    company_id=cid,
                    vendor_name="AWS Cloud Infrastructure India Pvt Ltd",
                    invoice_number=f"{code}-AP-2601",
                    invoice_date=date(2026, 4, 15),
                    due_date=date(2026, 5, 15),
                    total_amount=Decimal("85000.00"),
                    paid_amount=Decimal("85000.00"),
                    remaining_amount=Decimal("0.00"),
                    status="PAID",
                ),
                APInvoice(
                    company_id=cid,
                    vendor_name="Dell Technologies India (Hardware & Peripherals)",
                    invoice_number=f"{code}-AP-2602",
                    invoice_date=date(2026, 5, 10),
                    due_date=date(2026, 6, 10),
                    total_amount=Decimal("240000.00"),
                    paid_amount=Decimal("120000.00"),
                    remaining_amount=Decimal("120000.00"),
                    status="PARTIAL",
                ),
                APInvoice(
                    company_id=cid,
                    vendor_name="Tata Power Renewable Solar Systems",
                    invoice_number=f"{code}-AP-2603",
                    invoice_date=date(2026, 6, 1),
                    due_date=date(2026, 7, 1),
                    total_amount=Decimal("45000.00"),
                    paid_amount=Decimal("0.00"),
                    remaining_amount=Decimal("45000.00"),
                    status="UNPAID",
                ),
                APInvoice(
                    company_id=cid,
                    vendor_name="Reliance Freight & Logistics Services",
                    invoice_number=f"{code}-AP-2604",
                    invoice_date=date(2026, 6, 20),
                    due_date=date(2026, 7, 20),
                    total_amount=Decimal("32500.00"),
                    paid_amount=Decimal("32500.00"),
                    remaining_amount=Decimal("0.00"),
                    status="PAID",
                ),
                APInvoice(
                    company_id=cid,
                    vendor_name="Urban Ladder Commercial Furnishings",
                    invoice_number=f"{code}-AP-2605",
                    invoice_date=date(2026, 7, 5),
                    due_date=date(2026, 8, 5),
                    total_amount=Decimal("110000.00"),
                    paid_amount=Decimal("55000.00"),
                    remaining_amount=Decimal("55000.00"),
                    status="PARTIAL",
                ),
                APInvoice(
                    company_id=cid,
                    vendor_name="Bharti Airtel Telecom & Leased Lines",
                    invoice_number=f"{code}-AP-2606",
                    invoice_date=date(2026, 8, 12),
                    due_date=date(2026, 9, 12),
                    total_amount=Decimal("18500.00"),
                    paid_amount=Decimal("0.00"),
                    remaining_amount=Decimal("18500.00"),
                    status="UNPAID",
                ),
            ]
            for ap in ap_list:
                self.db.add(ap)
            counts["ap"] = len(ap_list)

        # 3. AR Invoices
        if self.db.query(ARInvoice).filter(ARInvoice.company_id == cid).count() == 0:
            ar_list = [
                ARInvoice(
                    company_id=cid,
                    customer_name="Tata Consultancy Services Ltd",
                    invoice_number=f"{code}-AR-5001",
                    invoice_date=date(2026, 4, 18),
                    due_date=date(2026, 5, 18),
                    total_amount=Decimal("350000.00"),
                    received_amount=Decimal("350000.00"),
                    remaining_amount=Decimal("0.00"),
                    status="PAID",
                ),
                ARInvoice(
                    company_id=cid,
                    customer_name="Infosys Enterprise Technologies Ltd",
                    invoice_number=f"{code}-AR-5002",
                    invoice_date=date(2026, 5, 22),
                    due_date=date(2026, 6, 22),
                    total_amount=Decimal("480000.00"),
                    received_amount=Decimal("240000.00"),
                    remaining_amount=Decimal("240000.00"),
                    status="PARTIAL",
                ),
                ARInvoice(
                    company_id=cid,
                    customer_name="HDFC Bank Corporate Treasury",
                    invoice_number=f"{code}-AR-5003",
                    invoice_date=date(2026, 6, 14),
                    due_date=date(2026, 7, 14),
                    total_amount=Decimal("220000.00"),
                    received_amount=Decimal("0.00"),
                    remaining_amount=Decimal("220000.00"),
                    status="UNPAID",
                ),
                ARInvoice(
                    company_id=cid,
                    customer_name="Mahindra & Mahindra Auto Division",
                    invoice_number=f"{code}-AR-5004",
                    invoice_date=date(2026, 7, 8),
                    due_date=date(2026, 8, 8),
                    total_amount=Decimal("620000.00"),
                    received_amount=Decimal("620000.00"),
                    remaining_amount=Decimal("0.00"),
                    status="PAID",
                ),
                ARInvoice(
                    company_id=cid,
                    customer_name="Wipro Digital Cloud Practice",
                    invoice_number=f"{code}-AR-5005",
                    invoice_date=date(2026, 7, 28),
                    due_date=date(2026, 8, 28),
                    total_amount=Decimal("175000.00"),
                    received_amount=Decimal("100000.00"),
                    remaining_amount=Decimal("75000.00"),
                    status="PARTIAL",
                ),
                ARInvoice(
                    company_id=cid,
                    customer_name="Apollo Hospitals Enterprise Ltd",
                    invoice_number=f"{code}-AR-5006",
                    invoice_date=date(2026, 8, 20),
                    due_date=date(2026, 9, 20),
                    total_amount=Decimal("310000.00"),
                    received_amount=Decimal("0.00"),
                    remaining_amount=Decimal("310000.00"),
                    status="UNPAID",
                ),
            ]
            for ar in ar_list:
                self.db.add(ar)
            counts["ar"] = len(ar_list)

        # 4. Fixed Assets
        if self.db.query(FixedAsset).filter(FixedAsset.company_id == cid).count() == 0:
            asset_list = [
                FixedAsset(
                    company_id=cid,
                    asset_code=f"FA-IT-{cid}01",
                    asset_name="Dell PowerEdge R750 Enterprise Cloud Server",
                    category="IT Infrastructure",
                    purchase_date=date(2025, 6, 1),
                    purchase_cost=Decimal("450000.00"),
                    accumulated_depreciation=Decimal("90000.00"),
                    current_net_value=Decimal("360000.00"),
                    status="ACTIVE",
                ),
                FixedAsset(
                    company_id=cid,
                    asset_code=f"FA-IT-{cid}02",
                    asset_name="Apple MacBook Pro M3 Max Engineering Fleet (x10)",
                    category="IT Hardware",
                    purchase_date=date(2025, 9, 15),
                    purchase_cost=Decimal("320000.00"),
                    accumulated_depreciation=Decimal("64000.00"),
                    current_net_value=Decimal("256000.00"),
                    status="ACTIVE",
                ),
                FixedAsset(
                    company_id=cid,
                    asset_code=f"FA-MAC-{cid}01",
                    asset_name="Cummins 125 kVA Silent DG Set & Power Backup",
                    category="Machinery & Plant",
                    purchase_date=date(2025, 4, 10),
                    purchase_cost=Decimal("550000.00"),
                    accumulated_depreciation=Decimal("55000.00"),
                    current_net_value=Decimal("495000.00"),
                    status="ACTIVE",
                ),
                FixedAsset(
                    company_id=cid,
                    asset_code=f"FA-VEH-{cid}01",
                    asset_name="Tata Ace EV Commercial Electric Delivery Van",
                    category="Vehicles & Logistics",
                    purchase_date=date(2025, 11, 20),
                    purchase_cost=Decimal("680000.00"),
                    accumulated_depreciation=Decimal("102000.00"),
                    current_net_value=Decimal("578000.00"),
                    status="ACTIVE",
                ),
                FixedAsset(
                    company_id=cid,
                    asset_code=f"FA-FUR-{cid}01",
                    asset_name="Steelcase Ergonomic Workstations & Boardroom Tables",
                    category="Furniture & Fixtures",
                    purchase_date=date(2025, 5, 25),
                    purchase_cost=Decimal("210000.00"),
                    accumulated_depreciation=Decimal("21000.00"),
                    current_net_value=Decimal("189000.00"),
                    status="ACTIVE",
                ),
                FixedAsset(
                    company_id=cid,
                    asset_code=f"FA-BLD-{cid}01",
                    asset_name="Centralised Multi-Zone VRV AC Cooling Infrastructure",
                    category="Facilities & Buildings",
                    purchase_date=date(2025, 3, 1),
                    purchase_cost=Decimal("380000.00"),
                    accumulated_depreciation=Decimal("38000.00"),
                    current_net_value=Decimal("342000.00"),
                    status="ACTIVE",
                ),
            ]
            for fa in asset_list:
                self.db.add(fa)
            counts["assets"] = len(asset_list)

        # 5. Budgets
        if target_fy_id and self.db.query(Budget).filter(Budget.company_id == cid).count() == 0:
            budget_specs = [
                ("5001", Decimal("1500000.00"), Decimal("920000.00")),
                ("5002", Decimal("480000.00"), Decimal("320000.00")),
                ("5003", Decimal("120000.00"), Decimal("95000.00")),
                ("1500", Decimal("250000.00"), Decimal("280000.00")),
                ("4001", Decimal("3000000.00"), Decimal("2450000.00")),
                ("4002", Decimal("1000000.00"), Decimal("850000.00")),
            ]
            b_list = []
            for code_acc, budgeted, actual in budget_specs:
                acc_id = acc_map.get(code_acc)
                if acc_id:
                    b_list.append(
                        Budget(
                            company_id=cid,
                            fiscal_year_id=target_fy_id,
                            account_id=acc_id,
                            budgeted_amount=budgeted,
                            actual_amount=actual,
                        )
                    )
            for b in b_list:
                self.db.add(b)
            counts["budgets"] = len(b_list)

        # 6. GST Records
        if self.db.query(GSTRecord).filter(GSTRecord.company_id == cid).count() == 0:
            gst_list = [
                GSTRecord(
                    company_id=cid,
                    transaction_ref=f"{code}-GST-INW-01",
                    hsn_sac="998314",
                    taxable_value=Decimal("85000.00"),
                    cgst_amount=Decimal("7650.00"),
                    sgst_amount=Decimal("7650.00"),
                    igst_amount=Decimal("0.00"),
                    total_tax=Decimal("15300.00"),
                ),
                GSTRecord(
                    company_id=cid,
                    transaction_ref=f"{code}-GST-INW-02",
                    hsn_sac="847130",
                    taxable_value=Decimal("240000.00"),
                    cgst_amount=Decimal("0.00"),
                    sgst_amount=Decimal("0.00"),
                    igst_amount=Decimal("43200.00"),
                    total_tax=Decimal("43200.00"),
                ),
                GSTRecord(
                    company_id=cid,
                    transaction_ref=f"{code}-GST-INW-03",
                    hsn_sac="997212",
                    taxable_value=Decimal("60000.00"),
                    cgst_amount=Decimal("5400.00"),
                    sgst_amount=Decimal("5400.00"),
                    igst_amount=Decimal("0.00"),
                    total_tax=Decimal("10800.00"),
                ),
                GSTRecord(
                    company_id=cid,
                    transaction_ref=f"{code}-GST-OUT-01",
                    hsn_sac="998313",
                    taxable_value=Decimal("350000.00"),
                    cgst_amount=Decimal("31500.00"),
                    sgst_amount=Decimal("31500.00"),
                    igst_amount=Decimal("0.00"),
                    total_tax=Decimal("63000.00"),
                ),
                GSTRecord(
                    company_id=cid,
                    transaction_ref=f"{code}-GST-OUT-02",
                    hsn_sac="998313",
                    taxable_value=Decimal("480000.00"),
                    cgst_amount=Decimal("0.00"),
                    sgst_amount=Decimal("0.00"),
                    igst_amount=Decimal("86400.00"),
                    total_tax=Decimal("86400.00"),
                ),
                GSTRecord(
                    company_id=cid,
                    transaction_ref=f"{code}-GST-OUT-03",
                    hsn_sac="998729",
                    taxable_value=Decimal("175000.00"),
                    cgst_amount=Decimal("15750.00"),
                    sgst_amount=Decimal("15750.00"),
                    igst_amount=Decimal("0.00"),
                    total_tax=Decimal("31500.00"),
                ),
            ]
            for g in gst_list:
                self.db.add(g)
            counts["gst"] = len(gst_list)

        self.db.commit()
        return counts

