import React from 'react';
import { Modal, Form, Input, Select } from 'antd';

const { Option } = Select;

const CreateProjectModal = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onCreate(values); // 将表单数据传回父组件
      form.resetFields();
    } catch (error) {
      console.error('表单校验失败:', error);
    }
  };

  return (
    <Modal
      title="初始化漫剧项目"
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="开始创作"
      cancelText="取消"
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ ratio: '16:9', stage: 'script' }}
        style={{ marginTop: 20 }}
      >
        <Form.Item
          name="title"
          label="项目名称"
          rules={[{ required: true, message: '请输入电影项目名称' }]}
        >
          <Input placeholder="例如：赛博丛林中的雨夜" maxLength={50} />
        </Form.Item>

        <Form.Item name="ratio" label="画面比例">
          <Select>
            <Option value="16:9">16:9 (横屏电影)</Option>
            <Option value="9:16">9:16 (短视频/竖屏)</Option>
            <Option value="2.35:1">2.35:1 (宽银幕)</Option>
            <Option value="1:1">1:1 (社交媒体风格)</Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="项目简述">
          <Input.TextArea 
            rows={3} 
            placeholder="简要描述你的故事背景或核心视觉风格..." 
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateProjectModal;