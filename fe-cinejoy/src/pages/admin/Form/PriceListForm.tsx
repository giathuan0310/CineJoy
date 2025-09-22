import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { InputRef } from 'antd';
import { Modal, Form, Input, DatePicker, Button, Table, InputNumber, Select, message } from "antd";

// CSS để ẩn scrollbar
const hideScrollbarStyle = `
  .hide-scrollbar .ant-modal-body::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar .ant-modal-body {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Thêm CSS vào head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = hideScrollbarStyle;
  document.head.appendChild(style);
}
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { 
  getProductsForPriceList,
  getAllPriceLists,
  type IPriceList,
  type IPriceListLine,
  type IProductsForPriceList
} from "@/apiservice/apiPriceList";

const { RangePicker } = DatePicker;

interface PriceListFormProps {
  priceList?: IPriceList;
  onSubmit: (priceListData: {
    name: string;
    startDate: string;
    endDate: string;
    lines: IPriceListLine[];
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PriceListForm: React.FC<PriceListFormProps> = ({
  priceList,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [lines, setLines] = useState<IPriceListLine[]>([]);
  const [products, setProducts] = useState<IProductsForPriceList>({ combos: [], singleProducts: [] });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [existingPriceLists, setExistingPriceLists] = useState<IPriceList[]>([]);
  const hasActivePriceList = useMemo(() => existingPriceLists.some(pl => pl.status === 'active'), [existingPriceLists]);
  const today = useMemo(() => dayjs().startOf('day'), []);
  const lockStartToday = useMemo(() => !priceList && !hasActivePriceList, [priceList, hasActivePriceList]);
  const nameInputRef = useRef<InputRef>(null);

  // Function to initialize all price lines for new price list
  const initializeAllPriceLines = useCallback(() => {
    const allLines: IPriceListLine[] = [];

    // Add all seat types
    const seatTypes: IPriceListLine[] = [
      { type: 'ticket', seatType: 'normal', price: 125000 },
      { type: 'ticket', seatType: 'vip', price: 130000 },
      { type: 'ticket', seatType: 'couple', price: 302000 },
      { type: 'ticket', seatType: '4dx', price: 150000 },
    ];
    allLines.push(...seatTypes);

    // Add all combos
    products.combos.forEach(combo => {
      allLines.push({
        type: 'combo',
        productId: combo._id,
        productName: combo.name,
        price: combo.price
      });
    });

    // Add all single products
    products.singleProducts.forEach(product => {
      allLines.push({
        type: 'single',
        productId: product._id,
        productName: product.name,
        price: product.price
      });
    });

    setLines(allLines);
  }, [products]);

  // Check if all products are already added
  const isAllProductsAdded = useCallback(() => {
    // For both new and editing price list, check if we have all seat types + all combos + all single products
    const hasAllSeatTypes = lines.filter(line => line.type === 'ticket').length === 4;
    const hasAllCombos = lines.filter(line => line.type === 'combo').length === products.combos.length;
    const hasAllSingleProducts = lines.filter(line => line.type === 'single').length === products.singleProducts.length;
    
    return hasAllSeatTypes && hasAllCombos && hasAllSingleProducts;
  }, [lines, products]);


  // Load products for price list
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await getProductsForPriceList();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
        message.error("Lỗi khi tải danh sách sản phẩm");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Load existing price lists for date validation (used for both add and edit)
  useEffect(() => {
    const loadExistingPriceLists = async () => {
      try {
        const data = await getAllPriceLists();
        setExistingPriceLists(data);
      } catch (error) {
        console.error("Error loading existing price lists:", error);
      }
    };

    loadExistingPriceLists();
  }, [priceList]);

  // Initialize all price lines when products are loaded and creating new price list
  useEffect(() => {
    if (!priceList && products.combos.length > 0 && products.singleProducts.length > 0) {
      initializeAllPriceLines();
    }
  }, [products, priceList, initializeAllPriceLines]);

  // Initialize form with default values
  useEffect(() => {
    if (priceList) {
      // Editing existing price list
      form.setFieldsValue({
        name: priceList.name,
        dateRange: [dayjs(priceList.startDate), dayjs(priceList.endDate)],
      });
      setLines(priceList.lines);
    } else {
      // Creating new price list
      const defaultStart = hasActivePriceList ? today.add(1, 'day') : today;
      const defaultEnd = defaultStart.add(1, 'month');
      form.setFieldsValue({
        name: "",
        dateRange: [defaultStart, defaultEnd],
      });
      // Lines will be initialized by the useEffect that depends on products
    }
  }, [priceList, form, hasActivePriceList]);

  // Focus tên bảng giá khi mở modal Thêm
  useEffect(() => {
    if (!priceList) {
      const t = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [priceList]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate name field
      if (!values.name || values.name.trim() === '') {
        message.error("Vui lòng nhập tên bảng giá");
        return;
      }
      
      // Validate date range
      if (!values.dateRange || values.dateRange.length !== 2) {
        message.error("Vui lòng chọn thời gian hiệu lực");
        return;
      }
      
      // Validate that endDate >= startDate
      if (values.dateRange[1] < values.dateRange[0]) {
        message.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        return;
      }
      
      if (lines.length === 0) {
        message.error("Vui lòng thêm ít nhất một dòng giá");
        return;
      }

      // Validate that all lines have required fields
      const incompleteLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.type === 'ticket') {
          if (!line.seatType) {
            incompleteLines.push(`Dòng ${i + 1}: Chưa chọn loại ghế`);
          }
        } else if (line.type === 'combo' || line.type === 'single') {
          if (!line.productId) {
            incompleteLines.push(`Dòng ${i + 1}: Chưa chọn ${line.type === 'combo' ? 'combo' : 'sản phẩm'}`);
          }
        }
        
        if (!line.price || line.price <= 0) {
          incompleteLines.push(`Dòng ${i + 1}: Giá phải lớn hơn 0`);
        }
      }
      
      if (incompleteLines.length > 0) {
        message.error(`Vui lòng hoàn thiện thông tin:\n${incompleteLines.join('\n')}`);
        return;
      }

      // Check for duplicates
      const duplicates = [];
      for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
          const line1 = lines[i];
          const line2 = lines[j];
          
          if (line1.type === 'ticket' && line2.type === 'ticket' && line1.seatType === line2.seatType) {
            duplicates.push(`Loại ghế ${line1.seatType} bị trùng lặp`);
          } else if (line1.type === 'combo' && line2.type === 'combo' && line1.productId === line2.productId) {
            duplicates.push(`Combo ${line1.productName} bị trùng lặp`);
          } else if (line1.type === 'single' && line2.type === 'single' && line1.productId === line2.productId) {
            duplicates.push(`Sản phẩm ${line1.productName} bị trùng lặp`);
          }
        }
      }
      
      if (duplicates.length > 0) {
        message.error(`Có sản phẩm/loại ghế bị trùng lặp: ${duplicates.join(', ')}`);
        return;
      }

      // Validate that all seat types are present
      const seatTypes = lines.filter(line => line.type === 'ticket').map(line => line.seatType);
      const requiredSeatTypes = ['normal', 'vip', 'couple', '4dx'];
      const missingSeatTypes = requiredSeatTypes.filter(seatType => !seatTypes.includes(seatType as 'normal' | 'vip' | 'couple' | '4dx'));
      
      if (missingSeatTypes.length > 0) {
        message.error(`Thiếu loại ghế: ${missingSeatTypes.join(', ')}`);
        return;
      }

      const submitData = {
        name: values.name,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        lines: lines,
      };

      onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting price list:", error);
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  const addLine = () => {
    setLines([...lines, { type: 'single', price: 0 }]);
    
    // Auto scroll to bottom after adding new line
    setTimeout(() => {
      const tableContainer = document.querySelector('.ant-table-body');
      if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight;
      }
    }, 100);
  };

  const removeLine = (index: number) => {
    const lineToRemove = lines[index];
    
    // Không cho phép xóa dòng vé xem phim
    if (lineToRemove.type === 'ticket') {
      message.warning("Không thể xóa loại ghế - phải có đầy đủ 4 loại ghế");
      return;
    }
    
    const newLines = lines.filter((_, i) => i !== index);
    setLines(newLines);
  };

  const updateLine = (index: number, field: keyof IPriceListLine, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Reset productId when type changes
    if (field === 'type') {
      newLines[index].productId = '';
      newLines[index].productName = '';
      newLines[index].seatType = undefined;
    }
    
    // Auto-populate product name and price when product is selected
    if (field === 'productId' && value) {
      const currentType = newLines[index].type;
      const filteredProducts = currentType === 'combo' 
        ? products.combos 
        : products.singleProducts;
      const selectedProduct = filteredProducts.find(p => p._id === value);
      if (selectedProduct) {
        newLines[index].productName = selectedProduct.name;
        newLines[index].price = selectedProduct.price;
      }
    }
    
    // Check for duplicates
    if (field === 'productId' || field === 'seatType') {
      const currentLine = newLines[index];
      const isDuplicate = newLines.some((line, i) => {
        if (i === index) return false; // Skip current line
        
        if (currentLine.type === 'ticket' && line.type === 'ticket') {
          return line.seatType === currentLine.seatType;
        } else if (currentLine.type === 'combo' && line.type === 'combo') {
          return line.productId === currentLine.productId;
        } else if (currentLine.type === 'single' && line.type === 'single') {
          return line.productId === currentLine.productId;
        }
        
        return false;
      });
      
      if (isDuplicate) {
        message.warning("Sản phẩm/loại ghế này đã tồn tại trong danh sách!");
        return; // Don't update if duplicate
      }
    }
    
    setLines(newLines);
  };


  const columns = [
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string, _: IPriceListLine, index: number) => (
        <Select
          value={type}
          onChange={(value) => updateLine(index, 'type', value)}
          style={{ width: '100%' }}
          placeholder="Chọn loại"
        >
          <Select.Option value="ticket">Vé xem phim</Select.Option>
          <Select.Option value="combo">Combo</Select.Option>
          <Select.Option value="single">Sản phẩm</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Sản phẩm / Loại ghế',
      dataIndex: 'productName',
      key: 'productName',
      render: (_: string, record: IPriceListLine, index: number) => {
        if (record.type === 'ticket') {
          // Get used seat types from other lines
          const usedSeatTypes = lines
            .filter((line, i) => i !== index && line.type === 'ticket')
            .map(line => line.seatType);
          
          return (
            <Select
              value={record.seatType}
              onChange={(value) => updateLine(index, 'seatType', value)}
              style={{ width: '100%' }}
              placeholder="Chọn loại ghế"
            >
              <Select.Option value="normal" disabled={usedSeatTypes.includes('normal')}>
                Ghế thường
              </Select.Option>
              <Select.Option value="vip" disabled={usedSeatTypes.includes('vip')}>
                Ghế VIP
              </Select.Option>
              <Select.Option value="couple" disabled={usedSeatTypes.includes('couple')}>
                Ghế cặp đôi
              </Select.Option>
              <Select.Option value="4dx" disabled={usedSeatTypes.includes('4dx')}>
                Ghế 4DX
              </Select.Option>
            </Select>
          );
        } else {
          // Filter products based on type
          const filteredProducts = record.type === 'combo' 
            ? products.combos 
            : products.singleProducts;
          
          // Get used product IDs from other lines of the same type
          const usedProductIds = lines
            .filter((line, i) => i !== index && line.type === record.type)
            .map(line => line.productId);
          
          return (
            <Select
              value={record.productId}
              onChange={(value) => updateLine(index, 'productId', value)}
              style={{ width: '100%' }}
              loading={loadingProducts}
              placeholder={`Chọn ${record.type === 'combo' ? 'combo' : 'sản phẩm'}`}
            >
              {filteredProducts.map(product => (
                <Select.Option 
                  key={product._id} 
                  value={product._id}
                  disabled={usedProductIds.includes(product._id)}
                >
                  {product.name}
                </Select.Option>
              ))}
            </Select>
          );
        }
      },
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price: number, _: IPriceListLine, index: number) => (
        <InputNumber
          value={price}
          onChange={(value) => updateLine(index, 'price', value || 0)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
          style={{ width: '100%' }}
          min={0}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_: IPriceListLine, record: IPriceListLine, index: number) => {
        // Không cho phép xóa dòng vé xem phim vì phải có đầy đủ 4 loại ghế
        const isTicketType = record.type === 'ticket';
        
        return (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => removeLine(index)}
            disabled={isTicketType}
            title={isTicketType ? "Không thể xóa loại ghế - phải có đầy đủ 4 loại ghế" : "Xóa dòng"}
          />
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', fontSize: '18px' }}>
          {priceList ? "Sửa bảng giá" : "Thêm bảng giá mới"}
        </div>
      }
      open={true}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
          {priceList ? "Cập nhật" : "Tạo mới"}
        </Button>,
      ]}
      width={800}
      centered
      bodyStyle={{ 
        maxHeight: '70vh', 
        overflowY: 'auto',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
      }}
      className="hide-scrollbar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên bảng giá"
          rules={[{ required: true, message: "Vui lòng nhập tên bảng giá" }]}
        >
          <Input placeholder="Ví dụ: Bảng giá T10/2025" ref={nameInputRef} />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian hiệu lực"
          rules={[{ required: true, message: "Vui lòng chọn thời gian hiệu lực" }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder={['Ngày bắt đầu', 'Ngày kết thúc (có thể cùng ngày)']}
            allowClear={false}
            inputReadOnly={lockStartToday}
            onCalendarChange={(dates) => {
              if (!dates) return;
              if (lockStartToday) {
                const end = dates[1] && dayjs(dates[1]);
                const clampedEnd = end && end.isAfter(today, 'day') ? end : (dates[0] && dayjs(dates[0]).isAfter(today, 'day') ? dayjs(dates[0]) : today.add(7, 'day'));
                // Giữ start = hôm nay, chỉ cho thay đổi end
                form.setFieldsValue({ dateRange: [today, clampedEnd || today.add(1, 'day')] });
              }
            }}
            onChange={(dates) => {
              if (!dates) return;
              if (lockStartToday) {
                const end = dates[1] || dates[0];
                form.setFieldsValue({ dateRange: [today, end || today.add(1, 'day')] });
              }
            }
            }
            disabledDate={(current) => {
              if (!current) return false;
              
              // When editing: allow selecting any day within the original range of this price list
              if (priceList) {
                const originalStart = dayjs(priceList.startDate).startOf('day');
                const originalEnd = dayjs(priceList.endDate).endOf('day');
                if (
                  current.isSame(originalStart, 'day') ||
                  current.isSame(originalEnd, 'day') ||
                  (current.isAfter(originalStart, 'day') && current.isBefore(originalEnd, 'day'))
                ) {
                  return false;
                }
              }

              // Disable past dates
              if (current < today) {
                return true;
              }

              // For creating new price list: if there is no active list, allow selecting today; otherwise disable today
              if (!priceList) {
                if (hasActivePriceList && current <= today) return true;
                // Nếu đang khóa theo quy tắc "bắt đầu hôm nay", đảm bảo không thể chọn start khác hôm nay
                if (lockStartToday && current.isSame(today, 'day')) return false;
              }
              
              // Check conflicts with existing price lists (for both add and edit)
              if (existingPriceLists.length > 0) {
                return existingPriceLists.some(pl => {
                  // When editing, ignore the current price list's own range
                  if (priceList && pl._id === priceList._id) return false;
                  const existingStart = dayjs(pl.startDate).startOf('day');
                  const existingEnd = dayjs(pl.endDate).endOf('day');
                  return current.isSame(existingStart, 'day') ||
                         current.isSame(existingEnd, 'day') ||
                         (current.isAfter(existingStart, 'day') && current.isBefore(existingEnd, 'day'));
                });
              }
              
              return false;
            }}
          />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 'bold' }}>Danh sách giá</span>
          </div>
          
          <Table
            columns={columns}
            dataSource={lines}
            rowKey={(_, index) => index || 0}
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />
          
          {!isAllProductsAdded() && (
            <div style={{ marginTop: 8 }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={addLine} style={{ width: '100%' }}>
                Thêm dòng
              </Button>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#666' }}>
            <strong>Lưu ý:</strong>
            <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
              {!priceList && !hasActivePriceList && (
                <li>
                  Hiện chưa có bảng giá đang hoạt động: Ngày bắt đầu được đặt cố định là
                  <span style={{ fontWeight: 600 }}> hôm nay</span> và không thể chỉnh sửa (chỉ chọn ngày kết thúc).
                </li>
              )}
              <li>Bảng giá phải có đầy đủ 4 loại ghế: Thường, VIP, Cặp đôi, 4DX</li>
              <li>Giá sản phẩm/combo sẽ được lấy từ giá niêm yết nếu không nhập</li>
              <li>Trạng thái mặc định là "Chờ hiệu lực" (Scheduled)</li>
              <li>Nút "Thêm dòng" sẽ ẩn khi đã có đầy đủ tất cả sản phẩm và loại ghế.</li>
              {!priceList && (
                <li>Ngày trong quá khứ và ngày trùng với bảng giá hiện có sẽ bị vô hiệu hóa.</li>
              )}
            </ul>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default PriceListForm;
