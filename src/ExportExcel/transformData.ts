/**
 * 获取所有日期字段
 * @param data 数据数组
 * @param dateListField 包含日期列表的字段名
 * @param dateField 日期字段名
 * @author hukang
 * @date 2025-07-23
 */
export function getAllDateKeys<T extends Record<string, any>>(
  data: T[],
  dateListField = "dateList",
  dateField = "planDate"
): string[] {
  const set = new Set<string>();
  data.forEach((item) => {
    const dateList = item[dateListField];
    if (Array.isArray(dateList)) {
      dateList.forEach((detail) => {
        if (detail[dateField]) set.add(String(detail[dateField]));
      });
    }
  });
  return Array.from(set);
}

/**
 * 通用 transformData，支持不同主表和明细结构
 * @param originalData 主表数据
 * @param typeMap 明细类型映射
 * @param options 配置项（dateListKey, dateFieldKey）
 * @author hukang
 * @date 2025-07-23
 */
export function transformData<
  T extends Record<string, any>, // 主表类型
  D extends Record<string, any> // 明细类型
>(
  originalData: T[],
  typeMap: { type: string; field: keyof D }[],
  options?: {
    dateListKey?: keyof T; // 主表中明细数组的字段名，默认 'dateList'
    dateFieldKey?: keyof D; // 明细中日期字段名，默认 'planDate'
  }
): Array<Omit<T, typeof dateListKey> & { type: string; rowSpan?: number } & Record<string, any>> {
  if (!originalData.length || !typeMap.length) return [];

  const dateListKey = (options?.dateListKey ?? "dateList") as keyof T;
  const dateFieldKey = (options?.dateFieldKey ?? "planDate") as keyof D;

  // 获取所有日期
  const dateKeys = getAllDateKeys(originalData, dateListKey as string, dateFieldKey as string);

  const result: Array<any> = [];
  originalData.forEach((item) => {
    // 拷贝主表字段，去掉明细数组
    const baseFields = { ...item };
    delete baseFields[dateListKey];
    const rowSpan = typeMap.length;
    const dateList = item[dateListKey] as D[] | undefined;

    typeMap.forEach(({ type, field }, idx) => {
      const obj: any = {
        ...baseFields,
        type,
        rowSpan: idx === 0 ? rowSpan : 0,
      };
      dateKeys.forEach((date) => {
        const found = dateList?.find((detail) => String(detail[dateFieldKey]) === date);
        obj[date] = found ? found[field] : "";
      });
      result.push(obj);
    });
  });

  return result;
}
export type TransformDataReturnType = ReturnType<typeof transformData>[number];
// 示例数据结构
export const originalData = [
  {
    workShopCode: "外机分厂",
    materialCode: "A001",
    materialName: "外机材料A",
    stockQuantity: 100,
    dateList: [
      {
        planDate: "2024/7/8",
        accountA: "10",
        accountB: "20",
        accountC: "30",
        accountD: "40",
        accountE: "50",
      },
      {
        planDate: "2024/7/9",
        accountA: "100",
        accountB: "200",
        accountC: "300",
        accountD: "400",
        accountE: "500",
      },
      {
        planDate: "2024/7/10",
        accountA: "100",
        accountB: "200",
        accountC: "300",
        accountD: "400",
        accountE: "500",
      },
    ],
  },
  {
    workShopCode: "内机分厂",
    materialCode: "A002",
    materialName: "内机材料B",
    stockQuantity: 200,
    dateList: [
      {
        planDate: "2024/7/8",
        accountA: "44",
        accountB: "55",
        accountC: "66",
        accountD: "77",
        accountE: "88",
      },
      {
        planDate: "2024/7/9",
        accountA: "440",
        accountB: "550",
        accountC: "660",
        accountD: "770",
        accountE: "880",
      },
    ],
  },
];

export const typeMap = [
  { type: "需求量", field: "accountA" },
  { type: "再制量", field: "accountB" },
  { type: "在途量", field: "accountC" },
  { type: "产品需求量", field: "accountD" },
  { type: "预测库存结余", field: "accountE" },
];

// 用法举例：
// transformData(originalData, typeMap, 'planDate');
