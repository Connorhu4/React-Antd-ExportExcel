import React from 'react';
import { Table, type TableProps } from 'antd';

import ExportExcel from './ExportExcel';
import { getAllDateKeys, transformData, type TransformDataReturnType } from './ExportExcel/transformData';
  const dataList = [
    {
      workshop: "Factory A",
      stock: 10000,
      productName: "Product 1",
      productCode: "P-001",
      dateList: [
        {
          date: "2025/07/15",
          demand: "1000",
          inProduction: "2000",
          inTransit: "3000",
          netDemand: "4000",
          forecastStock: "5000",
        },
        {
          date: "2025/07/16",
          demand: "1100",
          inProduction: "2100",
          inTransit: "3100",
          netDemand: "4100",
          forecastStock: "5100",
        },
        {
          date: "2025/07/17",
          demand: "1200",
          inProduction: "2200",
          inTransit: "3200",
          netDemand: "4200",
          forecastStock: "5200",
        },
        {
          date: "2025/07/18",
          demand: "1200",
          inProduction: "2200",
          inTransit: "3200",
          netDemand: "4200",
          forecastStock: "5200",
        },
        {
          date: "2025/07/19",
          demand: "1200",
          inProduction: "2200",
          inTransit: "3200",
          netDemand: "4200",
          forecastStock: "5200",
        },
      ],
    },
    {
      workshop: "Factory B",
      stock: 10000,
      productName: "Product 2",
      productCode: "P-002",
      dateList: [
        {
          date: "2025/07/15",
          demand: "1000",
          inProduction: "2000",
          inTransit: "3000",
          netDemand: "4000",
          forecastStock: "5000",
        },
        {
          date: "2025/07/16",
          demand: "1100",
          inProduction: "2100",
          inTransit: "3100",
          netDemand: "4100",
          forecastStock: "5100",
        },
        {
          date: "2025/07/17",
          demand: "1200",
          inProduction: "2200",
          inTransit: "3200",
          netDemand: "4200",
          forecastStock: "5200",
        },
      ],
    },
    {
      workshop: "Factory C",
      stock: 100003,
      productName: "Product 3",
      productCode: "P-003",
      dateList: [
        {
          date: "2025/07/15",
          demand: "1000",
          inProduction: "2000",
          inTransit: "3000",
          netDemand: "4000",
          forecastStock: "5000",
        },
        {
          date: "2025/07/16",
          demand: "1100",
          inProduction: "2100",
          inTransit: "3100",
          netDemand: "4100",
          forecastStock: "5100",
        },
        {
          date: "2025/07/17",
          demand: "1200",
          inProduction: "2200",
          inTransit: "3200",
          netDemand: "4200",
          forecastStock: "5200",
        },
      ],
    },
    {
      workshop: "Factory D",
      stock: 100004,
      productName: "Product 4",
      productCode: "P-004",
      dateList: [
        {
          date: "2025/07/15",
          demand: "1000",
          inProduction: "2000",
          inTransit: "3000",
          netDemand: "4000",
          forecastStock: "5000",
        },
        {
          date: "2025/07/16",
          demand: "1100",
          inProduction: "2100",
          inTransit: "3100",
          netDemand: "4100",
          forecastStock: "5100",
        },
        {
          date: "2025/07/17",
          demand: "1200",
          inProduction: "2200",
          inTransit: "3200",
          netDemand: "4200",
          forecastStock: "5200",
        },
      ],
    },
  ];
  // 通用类型映射
  const typeMap = [
    { type: "Demand", field: "demand" },
    { type: "In Production", field: "inProduction" },
    { type: "In Transit", field: "inTransit" },
    { type: "Net Demand", field: "netDemand" },
    { type: "Forecast Stock", field: "forecastStock" },
  ];

const dateKeys = getAllDateKeys(dataList, "dateList", "date");
  console.log(dateKeys)
  const columns: TableProps<TransformDataReturnType>["columns"] = [
    {
      title: "Workshop",
      dataIndex: "workshop",
      key: "workshop",
      fixed: "left",
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "Product Code",
      dataIndex: "productCode",
      key: "productCode",
      fixed: "left",
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      fixed: "left",
      render: (text: string) => ({
        children: (
          <span style={{ color: "#1677ff", cursor: "pointer" }}>
            {text}
          </span>
        ),
      }),
      onCell: (record: any) => ({
        rowSpan: record.rowSpan,
      }),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      fixed: "left",
      render: (value: string) => (
        <span style={{ color: "#1677ff", cursor: "pointer" }}>
          {value}
        </span>
      ),
    },
    // 动态生成日期列
    ...dateKeys.map((date) => ({
      title: date,
      dataIndex: date,
      key: date,
    })),
  ];
   
  const exportColumns = columns!
    .filter((col) => typeof col.title === "string")
    .map((col) => ({
      key: "dataIndex" in col ? col.dataIndex : undefined,
      title: col.title as string,
    }));
  const tableData = transformData(dataList, typeMap, {
      dateListKey: "dateList",
      dateFieldKey: "date",
  })
    console.log(tableData)
const App: React.FC = () => (
  <div style={{ padding: 24 }}>
      <ExportExcel
              mergeFields={["workshop", "productCode", "productName"]}
              data={tableData}
              columns={exportColumns}
              fileName="细表" 
              mainMergeField="workshop" // 新增：主条件字段名
            />
    <Table dataSource={tableData} columns={columns} pagination={false} />
  </div>
);

export default App;