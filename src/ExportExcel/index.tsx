/**
 * 支持导出Excel文件的组件
 * @param columns 表头配置，包含key和title
 * @param fileName 导出文件名，默认为"导出数据"
 * @param mergeFields 需要合并的字段列表
 * @param children 可选的子组件，点击时触发导出
 * @template T 数据类型
 * @author hukang
 * @date 2025-07-23
 */
import React, { ReactElement, ReactNode } from "react";
import { Button } from "antd";
import { utils, writeFile } from "xlsx-js-style";

interface ExportExcelProps<T> {
  data: T[];
  columns: { key: keyof T; title: string }[];
  fileName?: string;
  mergeFields?: (keyof T)[];
  children?: ReactNode;
  mainMergeField?: keyof T; // 新增：主条件字段名，如 "orderNo"
}

// 公共样式
const cellBorder = {
  top: { style: "thin", color: { rgb: "000000" } },
  bottom: { style: "thin", color: { rgb: "000000" } },
  left: { style: "thin", color: { rgb: "000000" } },
  right: { style: "thin", color: { rgb: "000000" } },
};

const cellAlignment = {
  vertical: "center",
  horizontal: "center",
};

const headerStyle = {
  fill: { fgColor: { rgb: "D9D9D9" } },
  font: { bold: true },
  alignment: cellAlignment,
  border: cellBorder,
};

const dataCellStyle = {
  alignment: cellAlignment,
  border: cellBorder,
};

const ExportExcel = <T extends Record<string, any>>({
  data,
  columns,
  fileName = "导出数据",
  mergeFields = [],
  children,
  mainMergeField,
}: ExportExcelProps<T>) => {
  const handleExport = () => {
    if (!data || data.length === 0) {
      console.warn("没有可导出的数据");
      return;
    }
    // 1. 准备导出数据（包含表头）
    const exportData = [
      columns.map((col) => col.title), // 第一行是表头
      ...data.map(
        (item) => columns.map((col) => item[col.key] ?? "") // 数据行
      ),
    ];

    // 2. 创建worksheet（不跳过表头）
    const worksheet = utils.aoa_to_sheet(exportData);

    // 3. 强制设置完整范围
    const fullRange = {
      s: { r: 0, c: 0 },
      e: { r: data.length, c: columns.length - 1 },
    };
    worksheet["!ref"] = utils.encode_range(fullRange);

    // 4. 初始化所有单元格并设置样式
    for (let R = fullRange.s.r; R <= fullRange.e.r; ++R) {
      for (let C = fullRange.s.c; C <= fullRange.e.c; ++C) {
        const cellAddress = utils.encode_cell({ r: R, c: C });

        // 强制创建/更新单元格对象
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = {
            t: "s",
            v: "",
            s: JSON.parse(JSON.stringify(dataCellStyle)), // 深拷贝避免引用问题
          };
        } else {
          // 保留原有值，仅更新样式
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            ...JSON.parse(JSON.stringify(dataCellStyle)), // 深拷贝
          };
        }
      }
    }

    // 5. 设置表头（必须在单元格初始化之后）
    columns.forEach((col, colIndex) => {
      const headerCell = utils.encode_cell({ r: 0, c: colIndex });
      worksheet[headerCell] = {
        t: "s",
        v: col.title,
        s: JSON.parse(JSON.stringify(headerStyle)),
      };
    });

    // 6. 处理合并单元格（必须在所有单元格初始化后）
    if (mergeFields.length > 0 && mainMergeField) {
      const merges: any[] = [];

      mergeFields.forEach((field) => {
        const colIndex = columns.findIndex((col) => col.key === field);
        if (colIndex === -1) return;

        let startRow = 1;
        let currentValue = data[0][field];
        let currentMainValue = data[0][mainMergeField];

        for (let i = 1; i <= data.length; i++) {
          const nextValue = i < data.length ? data[i][field] : undefined;
          const nextMainValue = i < data.length ? data[i][mainMergeField] : undefined;
          // 只有主条件字段和当前列都相同才合并
          if (i === data.length || nextValue !== currentValue || nextMainValue !== currentMainValue) {
            if (startRow < i) {
              merges.push({
                s: { r: startRow, c: colIndex },
                e: { r: i, c: colIndex },
              });
            }
            if (i < data.length) {
              currentValue = data[i][field];
              currentMainValue = data[i][mainMergeField];
              startRow = i + 1;
            }
          }
        }
      });

      worksheet["!merges"] = merges;
    }
    // 7. 设置列宽自适应
    const getCellWidth = (value: any) => {
      if (value == null) return 0;
      const str = String(value);
      let width = 0;
      for (let i = 0; i < str.length; i++) {
        width += str.charCodeAt(i) > 255 ? 2 : 1; // 中文2，英文1
      }
      return width;
    };
    const colWidths = columns.map((col) => {
      const header = col.title ? String(col.title) : "";
      let maxContent = getCellWidth(header);
      data.forEach((row) => {
        const cell = row[col.key];
        maxContent = Math.max(maxContent, getCellWidth(cell));
      });
      return { wch: maxContent + 2 }; // 适当加点余量
    });
    worksheet["!cols"] = colWidths;

    // 8. 导出文件
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // 添加时间戳
    const timestamp = new Date().toISOString().replace(/[:.]/g, "/").replace("T", "/").slice(0, 19);
    writeFile(workbook, `${fileName}_${timestamp}.xlsx`);
  };

  return React.isValidElement(children) ? (
    React.cloneElement(children as ReactElement<any>, { onClick: handleExport })
  ) : (
    <Button type="primary" onClick={handleExport}>
      导出
    </Button>
  );
};

export default ExportExcel;
