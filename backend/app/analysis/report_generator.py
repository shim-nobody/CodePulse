"""
CodePulse Report Generator
Exports PDF, JSON, and CSV analysis summaries.
"""
import json
import csv
import io
import os
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ReportGenerator:
    @staticmethod
    def generate_json(data: Dict[str, Any]) -> str:
        return json.dumps(data, indent=2, default=str)

    @staticmethod
    def generate_csv(functions: list, findings: list) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["=== FUNCTIONS METRICS ==="])
        writer.writerow(["Name", "StartLine", "EndLine", "CC", "Rank", "TimeComplexity", "SpaceComplexity", "MI", "Params"])
        for fn in functions:
            writer.writerow([
                fn.get("name"), fn.get("line_start"), fn.get("line_end"),
                fn.get("cyclomatic_complexity"), fn.get("cyclomatic_rank"),
                fn.get("time_complexity"), fn.get("space_complexity"),
                fn.get("maintainability_index"), fn.get("parameters_count")
            ])
        
        writer.writerow([])
        writer.writerow(["=== FINDINGS ==="])
        writer.writerow(["RuleID", "Severity", "Title", "Line", "WhyItMatters"])
        for f in findings:
            writer.writerow([
                f.get("rule_id"), f.get("severity"), f.get("title"),
                f.get("line_number"), f.get("why_it_matters")
            ])
            
        return output.getvalue()

    @staticmethod
    def generate_pdf(data: Dict[str, Any], filepath: str):
        doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()
        elements = []

        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Heading1"],
            fontSize=20,
            textColor=colors.HexColor("#2563EB"),
            spaceAfter=6
        )
        elements.append(Paragraph("CodePulse ? Static Analysis & Complexity Report", title_style))
        elements.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Engine v1.0.0", styles["Normal"]))
        elements.append(Spacer(1, 14))

        summary_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["Lines of Code (LOC)", str(data.get("loc", 0)), "Maintainability Index", f"{data.get('maintainability_index', 0)} / 100"],
            ["Avg Cyclomatic Complexity", f"{data.get('avg_cyclomatic_complexity', 1.0):.1f}", "Max Complexity", str(data.get("max_cyclomatic_complexity", 1))],
            ["Overall Time Complexity", str(data.get("overall_time_complexity", "O(1)")), "Overall Space", str(data.get("overall_space_complexity", "O(1)"))]
        ]
        t = Table(summary_data, colWidths=[140, 120, 140, 120])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EFF6FF")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 16))

        elements.append(Paragraph("Function Analysis Breakdown", styles["Heading2"]))
        fn_rows = [["Function", "Lines", "CC", "Time Comp.", "Space Comp.", "MI Score"]]
        for fn in data.get("functions", []):
            fn_rows.append([
                fn.get("name", ""),
                f"{fn.get('line_start')}-{fn.get('line_end')}",
                str(fn.get("cyclomatic_complexity", 1)),
                fn.get("time_complexity", "O(1)"),
                fn.get("space_complexity", "O(1)"),
                f"{fn.get('maintainability_index', 0):.1f}"
            ])
        if len(fn_rows) > 1:
            fn_table = Table(fn_rows, colWidths=[120, 70, 50, 100, 100, 80])
            fn_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F8FAFC")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]))
            elements.append(fn_table)
        elements.append(Spacer(1, 16))

        elements.append(Paragraph("Key Findings & Code Quality Smells", styles["Heading2"]))
        findings = data.get("findings", [])
        if findings:
            for f in findings[:6]:
                f_text = f"<b>[{f.get('severity', '').upper()}] {f.get('title')}</b> (Line {f.get('line_number', 'N/A')})<br/>{f.get('description')}<br/><i>Action:</i> {f.get('suggested_action')}"
                elements.append(Paragraph(f_text, styles["Normal"]))
                elements.append(Spacer(1, 6))
        else:
            elements.append(Paragraph("No critical smells or high-risk complexities detected.", styles["Normal"]))

        doc.build(elements)
