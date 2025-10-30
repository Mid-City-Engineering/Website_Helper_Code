# Shipping Label Auto-Printing Documentation

## Overview

This document describes the automatic shipping label printing system for validated deliveries in Odoo. The system leverages Odoo's built-in shipping provider integration (primarily UPS) and IoTBox functionality to automatically print shipping labels when deliveries are validated.

## Standard Workflow

The shipping process follows this sequence:

1. **Order Creation** - Users create a sales order and invoice
2. **Delivery Details** - Users fill in delivery details on the order
3. **Validation** - Users click to validate the delivery
4. **Shipping Provider Communication** - Odoo communicates with the shipping provider (mostly UPS)
5. **Label Generation** - UPS replies with a shipping label PDF
6. **Auto-Print** - The shipping label is automatically printed to the configured IoTBox printer
7. **Log Storage** - The shipping label PDF is viewable in the delivery logs

## System Configuration

### Shipping Label Reports

The auto-printing functionality uses two built-in Odoo QWeb reports, both configured to print PDF documents from the `stock.picking` data model:

#### 1. Shipping Labels Report

- **Report Name:** Shipping Labels
- **Report Link:** [View Report Configuration](https://mid-city-engineering.odoo.com/odoo/action-76/1062)
- **Data Model:** `stock.picking`
- **Template Key/ID:** `delivery_iot.report_shipping_labels`
- **IoTBox Configuration:** Linked to "Text - Zebra ZD421 300dpi"

#### 2. Shipping Docs Report

- **Report Name:** Shipping Docs
- **Report Link:** [View Report Configuration](https://mid-city-engineering.odoo.com/odoo/action-76/1063)
- **Data Model:** `stock.picking`
- **Template Key/ID:** `delivery_iot.report_shipping_docs`
- **IoTBox Configuration:** Linked to "Text - Zebra ZD421 300dpi"

### Printer Setup

**Shipping Room:**
- **IoTBox Name:** ShipDesk
- **Printer:** Text - Zebra ZD421 300dpi
- **Function:** Automatically prints shipping labels when deliveries are validated

### Implementation Details

The auto-printing functionality was enabled by:

1. **Locating Built-in Reports** - Identified the two existing shipping-related QWeb PDF reports in Odoo's delivery module
2. **Adding IoTBox Device** - Linked the Shipping Label Printer (from ShipDesk IoTBox) to both reports as an IoT device
3. **Automatic Triggering** - No custom code required; Odoo's built-in delivery validation workflow automatically generates and prints the reports

When a delivery is validated, Odoo:
- Contacts the shipping provider (UPS) to generate a shipping label
- Receives the label PDF from UPS
- Automatically triggers the configured reports
- Sends the print job to the linked IoTBox printer
- Stores the PDF in the delivery logs for future reference

## Known Behaviors

### Test vs. Production Deliveries

There is a known discrepancy between test and production deliveries:

- **Test Deliveries** - Validating test deliveries (e.g., test-box products to demo customers like "Mr Test") throws errors and does not auto-print shipping labels
- **Production Deliveries** - Validating real orders with actual customers works as expected and auto-prints correctly

Since production workflows function correctly, this behavior has been left as-is.

### Shipping Docs Report

The **Shipping Docs** report also has the IoTBox device linked, though it's uncertain whether this linkage is strictly necessary for the current workflow. Since the system functions correctly with this configuration, it has been left unchanged to avoid disrupting operations.

## Troubleshooting

### Labels Not Auto-Printing

**Shipping labels generated but not printing:**
- Verify the Zebra ZD421 300dpi is powered on and connected to ShipDesk IoTBox
- Check that the IoTBox device is properly linked in both report configurations
- Confirm the printer has label stock loaded
- Verify network connectivity between Odoo and the IoTBox

**"Test" orders throwing errors:**
- This is expected behavior for test/demo customers and products
- Use real customer and product data for actual deliveries

### Print Quality Issues

- Check for torn label debris on printer components (see Manufacturing Label Printing documentation for cleaning procedures)
- Verify label stock is appropriate for the printer
- Clean the print head if output is faded or unclear

## Maintenance

### Regular Checks

- Verify ShipDesk IoTBox connectivity
- Ensure adequate label stock is available
- Test auto-printing weekly with a real order to confirm functionality
- Check printer for label debris and clean as needed

### Printer Care

- Clean print heads according to manufacturer recommendations
- Remove any label debris or adhesive residue from rollers
- Keep printer interior free of dust and foreign material

## Additional Notes

- The auto-printing system uses Odoo's built-in shipping integration—no custom code or server actions are required
- The system primarily works with UPS but should function with other configured shipping providers
- Both "Shipping Labels" and "Shipping Docs" reports are linked to the same printer
- Shipping label PDFs remain accessible in delivery logs even after printing

---

**Last Updated:** October 30, 2025  
**System:** Odoo Online/SaaS  
**Module:** Delivery / Stock 
