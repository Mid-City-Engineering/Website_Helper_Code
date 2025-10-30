# Manufacturing Order Label Printing Documentation

## Overview

This document describes the label printing system for manufacturing orders (mrp.production) in Odoo. The system supports automatic label generation and printing for both product labels and box labels, with built-in data validation and flexible printer configuration.

## Label Types

The system supports four distinct label types:

### Product Labels

1. **2.25"×0.5" Harness Label** - For harness products
2. **1.5"×0.5" Module Label** - For small module products
3. **2.25"×0.5" Module Label** - For larger module products

### Box Labels

4. **4"×2" Box Label** - For shipping boxes

## System Components

### QWeb Views and Reports

Each label type consists of two components:

1. **QWeb Text View** - Contains the ZPL (Zebra Programming Language) template
2. **Report** - Links the view to IoTBox printers

| Label Type | View Name | View Key | Report Name |
|------------|-----------|----------|-------------|
| 2.25"×0.5" Harness Label | 2.25"×0.5" Harness Label | gen_key.f36f5e | Print 2.25"×0.5" Harness Label |
| 1.5"×0.5" Module Label | 1.5"×0.5" Module Label | gen_key.92a61d | Print 1.5"×0.5" Module Label |
| 2.25"×0.5" Module Label | 2.25"×0.5" Module Label | gen_key.ae84ac | Print 2.25"×0.5" Module Label |
| 4"×2" Box Label | 4"×2" Box Label | gen_key.31ecd7 | Print 4"×2" Box Label |

#### Quick Access Links

**Views:**
- [2.25"×0.5" Harness Label View](https://mid-city-engineering.odoo.com/odoo/action-31/4768)
- [1.5"×0.5" Module Label View](https://mid-city-engineering.odoo.com/odoo/action-31/4763)
- [2.25"×0.5" Module Label View](https://mid-city-engineering.odoo.com/odoo/action-31/4764)
- [4"×2" Box Label View](https://mid-city-engineering.odoo.com/odoo/action-31/4896)

**Reports:**
- [Print 2.25"×0.5" Harness Label Report](https://mid-city-engineering.odoo.com/odoo/action-76/1263)
- [Print 1.5"×0.5" Module Label Report](https://mid-city-engineering.odoo.com/odoo/action-76/1260)
- [Print 2.25"×0.5" Module Label Report](https://mid-city-engineering.odoo.com/odoo/action-76/1261)
- [Print 4"×2" Box Label Report](https://mid-city-engineering.odoo.com/odoo/action-76/1320)

### Server Actions

Two server actions handle the label printing workflow:

1. **[Print Product Label](https://mid-city-engineering.odoo.com/odoo/server-actions/1328)** - Prints product labels (harness or module)
2. **[Print Box Label](https://mid-city-engineering.odoo.com/odoo/server-actions/1330)** - Prints box labels

### Manufacturing Order UI

The manufacturing order form includes two action buttons:

- **Print Product Label** - Triggers the Print Product Label server action
- **Print Box Label** - Triggers the Print Box Label server action

## Workflow

### Print Product Label Workflow

When a user clicks the "Print Product Label" button, the system executes the following steps:

1. **Product Validation** - Verifies that the manufacturing order has a linked product. If no product is found, raises: `"No product found in this manufacturing order!"`

2. **Label Type Detection** - Determines the appropriate label type based on the product's internal reference:
   - Products ending in `-HRNS` → Harness Label
   - Products ending in `-MOD` → Small Module Label (default) or Big Module Label (if `x_needs_big_label` is set)
   - If the product has no internal reference, raises: `"The product has no internal reference name - this field is needed to determine lable size/design"`
   - If the product doesn't match either pattern, raises: `"No label type is specified for this product. We can only print labels for modules (small/big) and harnesses"`

3. **Data Validation** - Checks that all required fields for the label template are populated:
   - **For all label types:**
     - Product quantity > 0, or raises: `"Manufacturing order quantity must be greater than 0!"`
     - Lot/Serial Number exists, or raises: `"Generate a 'Lot/Serial Number' before trying to print the label"`
     - Product Internal Reference exists, or raises: `"This product does not have seem to have any Internal Reference Number"`
   - **For module labels only (in addition to above):**
     - Firmware version exists, or raises: `"This manufacturing order doesn't have a product firmware version"`

4. **Print Job Creation** - Determines the correct report based on label type and uses `report_action()` to create a new report record, which sends the print job to the printer

### Print Box Label Workflow

When a user clicks the "Print Box Label" button, the system executes the following steps:

1. **Product Validation** - Verifies that the manufacturing order has a linked product. If no product is found, raises: `"No product found in this manufacturing order!"`

2. **Box Requirement Check** - Confirms the product requires a box. If `x_needs_box` is not set, raises: `"This product doesn't need a box."`

3. **Data Validation** - Checks that all required fields for the box label template are populated:
   - Product name exists, or raises: `"The product must have a name!"`
   - Product quantity > 0, or raises: `"Manufacturing order quantity must be greater than 0!"`
   - Lot/Serial Number exists, or raises: `"Generate a 'Lot/Serial Number' before trying to print the label"`
   - Product Internal Reference exists, or raises: `"This product does not have seem to have any Internal Reference Number"`
   - Product Firmware version exists, or raises: `"This module doesn't have a product firmware version"`

4. **Print Job Creation** - Uses `report_action()` to create a new record of the "Print 4"×2" Box Label" report, sending the print job to the printer

## Printer Setup

### Hardware Configuration

**Manufacturing Room:**
- **IoTBox Name:** MfgDesk
- **Printer 1:** Product Label Printer (203 DPI Zebra)
  - Prints 2.25"×0.5" Harness Labels
  - Prints 1.5"×0.5" Module Labels
  - Prints 2.25"×0.5" Module Labels
- **Printer 2:** Box Label Printer (203 DPI Zebra)
  - Prints 4"×2" Box Labels

**Shipping Room:**
- **IoTBox Name:** ShipDesk
- **Printer:** Shipping Label Printer (300 DPI Zebra)
  - Available as backup for manufacturing labels

## DPI-Based Scaling and Adjustments

To ensure manufacturing continuity even if both manufacturing printers fail or if the manufacturing printers are updated, the ZPL templates are designed with DPI-based scaling. This allows the use of printers with different DPI resolutions (such as the 300 DPI shipping printer) as an emergency backup with extremely minimal code changes - only 1 line needs to be changed for each affected label type!

### ZPL Template Structure

Each of the four ZPL templates begins with a comprehensive configuration section that automatically scales all label elements based on printer DPI:

```xml
<odoo>
  <template id="<view's genid>">
    <t t-foreach="docs" t-as="manufacturing_order">
      <!-- DPI Configuration -->
      <t t-set="current_printer_dpi" t-value="203"/>
      <t t-set="default_dpi" t-value="203"/>
      <t t-set="dpi_scale" t-value="current_printer_dpi / default_dpi"/>
      
      <!-- Label Dimensions -->
      <t t-set="label_width" t-value="int(width_in_inches  * default_dpi * dpi_scale)"/>
      <t t-set="label_height" t-value="int(height_in_inches * default_dpi * dpi_scale)"/>
      
      <!-- Scaled Font Sizes -->
      <t t-set="font_height_medium" t-value="int(20 * dpi_scale)"/>
      <t t-set="font_width_medium" t-value="int(20 * dpi_scale)"/>
      
      <!-- Border Offsets -->
      <t t-set="medium_border_offset" t-value="int(7 * dpi_scale)"/>
      
      <!-- Margins and Spacing -->
      <t t-set="margin" t-value="int(label_width * 0.03)"/>
      <t t-set="spacing" t-value="int(label_height * 0.05)"/>
      
      <!-- QR Code Configuration -->
      <t t-set="qr_size" t-value="int(label_height * 0.85)"/>
      <t t-set="qr_x" t-value="int(label_width * 0.78)"/>
      
      <!-- Text Positions -->
      <t t-set="text_x" t-value="margin + int(2 * dpi_scale)"/>
      <t t-set="row1_y" t-value="int(label_height * 0.12)"/>
```

This configuration calculates a scaling factor based on the printer's DPI and applies it to all label elements including dimensions, fonts, borders, margins, QR codes, and text positioning throughout the label template. While this approach maximizes DPI compatibility, it requires manual adjustment of the `current_printer_dpi` value when switching to a different resolution printer.

### Switching to a Different DPI Printer

If you need to use a printer with a different DPI (such as the 300 DPI shipping printer), follow these steps:

1. Navigate to the appropriate QWeb view using the links in the [QWeb Views and Reports](#qweb-views-and-reports) section
2. Locate the DPI Configuration section at the top of the template
3. Change the `current_printer_dpi` value to match your printer's DPI:
   ```xml
   <t t-set="current_printer_dpi" t-value="300"/>
   ```
4. Save the view
5. The system will automatically recalculate all scaling factors based on the new DPI

**Example:** To use the 300 DPI shipping printer for manufacturing labels, change `current_printer_dpi` from `203` to `300` in the relevant view(s). All label elements will automatically scale to maintain proper proportions and readability.

**Note:** You only need to modify the views for the label types you intend to print on the different DPI printer. The `default_dpi` value (203) should remain unchanged as it represents the original design resolution.

## Printer Failover Scenarios

### Scenario 1: One Manufacturing Printer Fails

If either the Product Label Printer or Box Label Printer in the manufacturing room fails:

1. **Swap the label roll** - Load the appropriate label size into the functioning printer
2. **Continue printing** - No code changes are required since both printers use 203 DPI resolution
3. **Update printer assignment** - Temporarily redirect print jobs to the working printer in the report configuration if needed

**Example:** If the Product Label Printer fails, you can load product label rolls (2.25"×0.5" or 1.5"×0.5") into the Box Label Printer and continue production without any system modifications.

### Scenario 2: Both Manufacturing Printers Fail

If both 203 DPI printers in the manufacturing room are down:

1. **Use the Shipping Room printer** - The 300 DPI Zebra printer on ShipDesk can serve as an emergency backup
2. **Update DPI configuration** - Modify the `current_printer_dpi` value in the relevant QWeb views:
   - Navigate to the view(s) for the label type(s) you need to print
   - Change `<t t-set="current_printer_dpi" t-value="203"/>` to `<t t-set="current_printer_dpi" t-value="300"/>`
   - Save the view(s)
3. **Load appropriate labels** - Ensure the shipping printer has the correct label roll loaded
4. **Print labels** - The DPI-based scaling will automatically adjust the label layout for the 300 DPI printer
5. **Restore configuration** - Once the manufacturing printers are repaired, remember to change the `current_printer_dpi` values back to `203`

**Important:** Document any temporary DPI changes to ensure they are reverted once normal operations resume.

## Troubleshooting

### Common Error Messages

#### Product Label Errors

**"No product found in this manufacturing order!"**
- The manufacturing order does not have a linked product
- Ensure a product is selected before attempting to print labels

**"The product has no internal reference name - this field is needed to determine lable size/design"**
- The product is missing its Internal Reference (default_code)
- Add an Internal Reference to the product record
- The Internal Reference must end in `-HRNS` (for harness) or `-MOD` (for module)

**"No label type is specified for this product. We can only print labels for modules (small/big) and harnesses"**
- The product's Internal Reference doesn't match expected patterns
- Ensure the Internal Reference ends with either `-HRNS` or `-MOD`

**"Manufacturing order quantity must be greater than 0!"**
- The manufacturing order has a quantity of 0 or negative
- Update the product quantity to a positive value

**"Generate a 'Lot/Serial Number' before trying to print the label"**
- The manufacturing order is missing a Lot/Serial Number
- Generate or assign a Lot/Serial Number before printing

**"This product does not have seem to have any Internal Reference Number"**
- The product is missing its Internal Reference field
- Add an Internal Reference to the product record

**"This manufacturing order doesn't have a product firmware version"** (Module labels only)
- The manufacturing order is missing the firmware version field (`x_studio_firmware_version`)
- Fill in the firmware version before printing module labels

#### Box Label Errors

**"This product doesn't need a box."**
- The product's `x_needs_box` field is not set to True
- Only products that require boxes can have box labels printed
- If this product should have a box, enable the `x_needs_box` field on the product

**"The product must have a name!"**
- The product record is missing a name
- Add a product name before printing box labels

**"This module doesn't have a product firmware version"**
- The product is missing the firmware version field (`x_studio_production_firmware_1`)
- Fill in the product firmware version before printing box labels

### Printer Issues

1. **Printer not responding:**
   - Check IoTBox connection
   - Verify printer is powered on and connected to the IoTBox
   - Check label roll is loaded correctly

2. **Wrong label size printing:**
   - Verify correct label roll is loaded in the printer
   - Confirm the correct printer is selected in the report configuration

3. **Irregular or poor print quality:**
   - **Check for torn label debris** - Inspect the printer's internal components (print head, rollers, and label path) for any torn label segments or adhesive residue that may be stuck to printer components
   - Clean the print head with appropriate cleaning supplies
   - Verify label roll is properly aligned and tensioned
   - Check that the label stock is not damaged or defective

4. **Both manufacturing printers down:**
   - Temporarily use the shipping room printer (ShipDesk)
   - Update the DPI configuration in the relevant views as described in [Printer Failover Scenarios](#printer-failover-scenarios)

## Maintenance

### Regular Checks

- Verify IoTBox connectivity for both MfgDesk and ShipDesk
- Ensure label rolls are stocked for both product and box label printers
- Test print from each printer weekly to confirm proper operation
- **Inspect printers for label debris** - Check printer components regularly (at least weekly) for any torn label segments or adhesive buildup. Clean immediately if found to prevent print quality issues.

### Cleaning Procedures

- Clean print heads according to manufacturer recommendations
- Remove any label debris or adhesive residue from rollers and internal components
- Keep the printer interior free of dust and foreign material

### Updates

When modifying label templates:
1. Always test prints at 203 DPI (standard configuration)
2. If possible, test at 300 DPI to verify scaling works correctly
3. Document any changes to required fields in the server actions
4. Keep a record of any temporary DPI configuration changes during printer failover situations

---

**Last Updated:** October 30, 2025  
**System:** Odoo Online/SaaS  
**Module:** Manufacturing (MRP)
**Data Model:** mrp.production (Manufacturing Order)
