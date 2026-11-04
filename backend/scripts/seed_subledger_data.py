"""
Seed Subledger Demo Data for STACKLY SAP OneERP Platform.
Populates realistic commercial data for:
  - Accounts Payable (AP) Supplier Invoices & Payments
  - Accounts Receivable (AR) Customer Invoices & Receipts
  - Fixed Assets Master with Accumulated Depreciation
  - Budget Plan vs Actual Allocations with Variance
  - GST Compliance Records (Inward & Outward, CGST, SGST, IGST)
"""
import os
import sys
from datetime import date, timedelta
from decimal import Decimal

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.db.database import SessionLocal
from app.models.company import Company
from app.models.account import Account
from app.models.financial_year import FiscalYear
from app.models.subledger import APInvoice, ARInvoice, FixedAsset, Budget, GSTRecord
from app.services.company_service import CompanyService
from app.services.account_service import AccountService
from app.schemas.financial_year import FiscalYearCreate


def seed_subledger_for_company(db, company: Company):
    cid = company.company_id
    code = company.company_code
    print(f"\n=======================================================")
    print(f"[*] Seeding Subledger Data for: [{code}] {company.company_name}")
    print(f"=======================================================")

    # 1. Ensure Standard Accounts Exist
    accounts = db.query(Account).filter(Account.company_id == cid).all()
    if not accounts:
        print("  - Seeding standard Chart of Accounts...")
        CompanyService(db)._seed_default_accounts(cid, "SEEDER")
        accounts = db.query(Account).filter(Account.company_id == cid).all()
    acc_map = {a.account_code: a.account_id for a in accounts}

    # 2. Ensure Active Fiscal Year Exists
    fys = db.query(FiscalYear).filter(FiscalYear.company_id == cid).all()
    if not fys:
        print("  - Creating Fiscal Year FY 2026-2027...")
        fy = AccountService(db).create_fiscal_year(
            FiscalYearCreate(
                company_id=cid,
                year_name="FY 2026-2027",
                start_date=date(2026, 4, 1),
                end_date=date(2027, 3, 31),
            )
        )
        fys = [fy]
    target_fy_id = fys[0].fiscal_year_id

    # 3. Seed Accounts Payable (AP)
    existing_ap = db.query(APInvoice).filter(APInvoice.company_id == cid).count()
    if existing_ap == 0:
        ap_data = [
            {
                "vendor_name": "AWS Cloud Infrastructure India Pvt Ltd",
                "invoice_number": f"{code}-AP-2601",
                "invoice_date": date(2026, 4, 15),
                "due_date": date(2026, 5, 15),
                "total_amount": Decimal("85000.00"),
                "paid_amount": Decimal("85000.00"),
                "remaining_amount": Decimal("0.00"),
                "status": "PAID",
            },
            {
                "vendor_name": "Dell Technologies India (Hardware & Peripherals)",
                "invoice_number": f"{code}-AP-2602",
                "invoice_date": date(2026, 5, 10),
                "due_date": date(2026, 6, 10),
                "total_amount": Decimal("240000.00"),
                "paid_amount": Decimal("120000.00"),
                "remaining_amount": Decimal("120000.00"),
                "status": "PARTIAL",
            },
            {
                "vendor_name": "Tata Power Renewable Solar Systems",
                "invoice_number": f"{code}-AP-2603",
                "invoice_date": date(2026, 6, 1),
                "due_date": date(2026, 7, 1),
                "total_amount": Decimal("45000.00"),
                "paid_amount": Decimal("0.00"),
                "remaining_amount": Decimal("45000.00"),
                "status": "UNPAID",
            },
            {
                "vendor_name": "Reliance Freight & Logistics Services",
                "invoice_number": f"{code}-AP-2604",
                "invoice_date": date(2026, 6, 20),
                "due_date": date(2026, 7, 20),
                "total_amount": Decimal("32500.00"),
                "paid_amount": Decimal("32500.00"),
                "remaining_amount": Decimal("0.00"),
                "status": "PAID",
            },
            {
                "vendor_name": "Urban Ladder Commercial Furnishings",
                "invoice_number": f"{code}-AP-2605",
                "invoice_date": date(2026, 7, 5),
                "due_date": date(2026, 8, 5),
                "total_amount": Decimal("110000.00"),
                "paid_amount": Decimal("55000.00"),
                "remaining_amount": Decimal("55000.00"),
                "status": "PARTIAL",
            },
            {
                "vendor_name": "Bharti Airtel Telecom & Leased Lines",
                "invoice_number": f"{code}-AP-2606",
                "invoice_date": date(2026, 8, 12),
                "due_date": date(2026, 9, 12),
                "total_amount": Decimal("18500.00"),
                "paid_amount": Decimal("0.00"),
                "remaining_amount": Decimal("18500.00"),
                "status": "UNPAID",
            },
        ]
        for ap in ap_data:
            db.add(APInvoice(company_id=cid, **ap))
        print(f"  [+] Added {len(ap_data)} Accounts Payable (AP) supplier invoices.")
    else:
        print(f"  [*] AP already has {existing_ap} invoices.")

    # 4. Seed Accounts Receivable (AR)
    existing_ar = db.query(ARInvoice).filter(ARInvoice.company_id == cid).count()
    if existing_ar == 0:
        ar_data = [
            {
                "customer_name": "Tata Consultancy Services Ltd",
                "invoice_number": f"{code}-AR-5001",
                "invoice_date": date(2026, 4, 18),
                "due_date": date(2026, 5, 18),
                "total_amount": Decimal("350000.00"),
                "received_amount": Decimal("350000.00"),
                "remaining_amount": Decimal("0.00"),
                "status": "PAID",
            },
            {
                "customer_name": "Infosys Enterprise Technologies Ltd",
                "invoice_number": f"{code}-AR-5002",
                "invoice_date": date(2026, 5, 22),
                "due_date": date(2026, 6, 22),
                "total_amount": Decimal("480000.00"),
                "received_amount": Decimal("240000.00"),
                "remaining_amount": Decimal("240000.00"),
                "status": "PARTIAL",
            },
            {
                "customer_name": "HDFC Bank Corporate Treasury",
                "invoice_number": f"{code}-AR-5003",
                "invoice_date": date(2026, 6, 14),
                "due_date": date(2026, 7, 14),
                "total_amount": Decimal("220000.00"),
                "received_amount": Decimal("0.00"),
                "remaining_amount": Decimal("220000.00"),
                "status": "UNPAID",
            },
            {
                "customer_name": "Mahindra & Mahindra Auto Division",
                "invoice_number": f"{code}-AR-5004",
                "invoice_date": date(2026, 7, 8),
                "due_date": date(2026, 8, 8),
                "total_amount": Decimal("620000.00"),
                "received_amount": Decimal("620000.00"),
                "remaining_amount": Decimal("0.00"),
                "status": "PAID",
            },
            {
                "customer_name": "Wipro Digital Cloud Practice",
                "invoice_number": f"{code}-AR-5005",
                "invoice_date": date(2026, 7, 28),
                "due_date": date(2026, 8, 28),
                "total_amount": Decimal("175000.00"),
                "received_amount": Decimal("100000.00"),
                "remaining_amount": Decimal("75000.00"),
                "status": "PARTIAL",
            },
            {
                "customer_name": "Apollo Hospitals Enterprise Ltd",
                "invoice_number": f"{code}-AR-5006",
                "invoice_date": date(2026, 8, 20),
                "due_date": date(2026, 9, 20),
                "total_amount": Decimal("310000.00"),
                "received_amount": Decimal("0.00"),
                "remaining_amount": Decimal("310000.00"),
                "status": "UNPAID",
            },
        ]
        for ar in ar_data:
            db.add(ARInvoice(company_id=cid, **ar))
        print(f"  [+] Added {len(ar_data)} Accounts Receivable (AR) customer invoices.")
    else:
        print(f"  [*] AR already has {existing_ar} invoices.")

    # 5. Seed Fixed Assets
    existing_fa = db.query(FixedAsset).filter(FixedAsset.company_id == cid).count()
    if existing_fa == 0:
        asset_data = [
            {
                "asset_code": f"FA-IT-{cid}01",
                "asset_name": "Dell PowerEdge R750 Enterprise Cloud Server",
                "category": "IT Infrastructure",
                "purchase_date": date(2025, 6, 1),
                "purchase_cost": Decimal("450000.00"),
                "accumulated_depreciation": Decimal("90000.00"),
                "current_net_value": Decimal("360000.00"),
                "status": "ACTIVE",
            },
            {
                "asset_code": f"FA-IT-{cid}02",
                "asset_name": "Apple MacBook Pro M3 Max Engineering Fleet (x10)",
                "category": "IT Hardware",
                "purchase_date": date(2025, 9, 15),
                "purchase_cost": Decimal("320000.00"),
                "accumulated_depreciation": Decimal("64000.00"),
                "current_net_value": Decimal("256000.00"),
                "status": "ACTIVE",
            },
            {
                "asset_code": f"FA-MAC-{cid}01",
                "asset_name": "Cummins 125 kVA Silent DG Set & Power Backup",
                "category": "Machinery & Plant",
                "purchase_date": date(2025, 4, 10),
                "purchase_cost": Decimal("550000.00"),
                "accumulated_depreciation": Decimal("55000.00"),
                "current_net_value": Decimal("495000.00"),
                "status": "ACTIVE",
            },
            {
                "asset_code": f"FA-VEH-{cid}01",
                "asset_name": "Tata Ace EV Commercial Electric Delivery Van",
                "category": "Vehicles & Logistics",
                "purchase_date": date(2025, 11, 20),
                "purchase_cost": Decimal("680000.00"),
                "accumulated_depreciation": Decimal("102000.00"),
                "current_net_value": Decimal("578000.00"),
                "status": "ACTIVE",
            },
            {
                "asset_code": f"FA-FUR-{cid}01",
                "asset_name": "Steelcase Ergonomic Workstations & Boardroom Tables",
                "category": "Furniture & Fixtures",
                "purchase_date": date(2025, 5, 25),
                "purchase_cost": Decimal("210000.00"),
                "accumulated_depreciation": Decimal("21000.00"),
                "current_net_value": Decimal("189000.00"),
                "status": "ACTIVE",
            },
            {
                "asset_code": f"FA-BLD-{cid}01",
                "asset_name": "Centralised Multi-Zone VRV AC Cooling Infrastructure",
                "category": "Facilities & Buildings",
                "purchase_date": date(2025, 3, 1),
                "purchase_cost": Decimal("380000.00"),
                "accumulated_depreciation": Decimal("38000.00"),
                "current_net_value": Decimal("342000.00"),
                "status": "ACTIVE",
            },
        ]
        for fa in asset_data:
            db.add(FixedAsset(company_id=cid, **fa))
        print(f"  [+] Added {len(asset_data)} Fixed Assets.")
    else:
        print(f"  [*] Fixed Assets already has {existing_fa} items.")

    # 6. Seed Budgeting
    existing_b = db.query(Budget).filter(Budget.company_id == cid).count()
    if existing_b == 0:
        budget_specs = [
            ("5001", Decimal("1500000.00"), Decimal("920000.00")),   # Salary & Wages (Under Budget)
            ("5002", Decimal("480000.00"), Decimal("320000.00")),    # Office Rent (Under Budget)
            ("5003", Decimal("120000.00"), Decimal("95000.00")),     # Utilities (Under Budget)
            ("1500", Decimal("250000.00"), Decimal("280000.00")),    # Equipment (Over Budget - Red)
            ("4001", Decimal("3000000.00"), Decimal("2450000.00")),  # Sales Revenue Target
            ("4002", Decimal("1000000.00"), Decimal("850000.00")),   # Consulting Target
        ]
        b_count = 0
        for code_acc, budgeted, actual in budget_specs:
            acc_id = acc_map.get(code_acc)
            if acc_id:
                db.add(
                    Budget(
                        company_id=cid,
                        fiscal_year_id=target_fy_id,
                        account_id=acc_id,
                        budgeted_amount=budgeted,
                        actual_amount=actual,
                    )
                )
                b_count += 1
        print(f"  [+] Added {b_count} Account Budget Allocations.")
    else:
        print(f"  [*] Budgets already has {existing_b} records.")

    # 7. Seed GST Compliance Records
    existing_gst = db.query(GSTRecord).filter(GSTRecord.company_id == cid).count()
    if existing_gst == 0:
        gst_data = [
            {
                "transaction_ref": f"{code}-GST-INW-01",
                "hsn_sac": "998314",
                "taxable_value": Decimal("85000.00"),
                "cgst_amount": Decimal("7650.00"),
                "sgst_amount": Decimal("7650.00"),
                "igst_amount": Decimal("0.00"),
                "total_tax": Decimal("15300.00"),
            },
            {
                "transaction_ref": f"{code}-GST-INW-02",
                "hsn_sac": "847130",
                "taxable_value": Decimal("240000.00"),
                "cgst_amount": Decimal("0.00"),
                "sgst_amount": Decimal("0.00"),
                "igst_amount": Decimal("43200.00"),
                "total_tax": Decimal("43200.00"),
            },
            {
                "transaction_ref": f"{code}-GST-INW-03",
                "hsn_sac": "997212",
                "taxable_value": Decimal("60000.00"),
                "cgst_amount": Decimal("5400.00"),
                "sgst_amount": Decimal("5400.00"),
                "igst_amount": Decimal("0.00"),
                "total_tax": Decimal("10800.00"),
            },
            {
                "transaction_ref": f"{code}-GST-OUT-01",
                "hsn_sac": "998313",
                "taxable_value": Decimal("350000.00"),
                "cgst_amount": Decimal("31500.00"),
                "sgst_amount": Decimal("31500.00"),
                "igst_amount": Decimal("0.00"),
                "total_tax": Decimal("63000.00"),
            },
            {
                "transaction_ref": f"{code}-GST-OUT-02",
                "hsn_sac": "998313",
                "taxable_value": Decimal("480000.00"),
                "cgst_amount": Decimal("0.00"),
                "sgst_amount": Decimal("0.00"),
                "igst_amount": Decimal("86400.00"),
                "total_tax": Decimal("86400.00"),
            },
            {
                "transaction_ref": f"{code}-GST-OUT-03",
                "hsn_sac": "998729",
                "taxable_value": Decimal("175000.00"),
                "cgst_amount": Decimal("15750.00"),
                "sgst_amount": Decimal("15750.00"),
                "igst_amount": Decimal("0.00"),
                "total_tax": Decimal("31500.00"),
            },
        ]
        for g in gst_data:
            db.add(GSTRecord(company_id=cid, **g))
        print(f"  [+] Added {len(gst_data)} GST Compliance Records.")
    else:
        print(f"  [*] GST already has {existing_gst} records.")

    db.commit()


def main():
    db = SessionLocal()
    try:
        companies = db.query(Company).all()
        if not companies:
            print("No companies found in database!")
            return

        for company in companies:
            seed_subledger_for_company(db, company)

        print("\n=======================================================")
        print("[SUCCESS] All Subledger Demo Data Seeded Successfully!")
        print("=======================================================\n")
    finally:
        db.close()


if __name__ == "__main__":
    main()
