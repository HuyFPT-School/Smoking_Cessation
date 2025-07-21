import { Card, Typography, Table } from "antd";
import { PieChartOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const columns = [
  {
    title: "Cookie Type",
    dataIndex: "type",
    key: "type",
    render: (text) => <strong style={{ color: "#237804" }}>{text}</strong>,
  },
  {
    title: "Purpose",
    dataIndex: "purpose",
    key: "purpose",
  },
];

const data = [
  {
    key: "1",
    type: "Essential Cookies",
    purpose: "Used for login and secure session handling",
  },
  {
    key: "2",
    type: "Analytics Cookies",
    purpose: "Help us track usage and improve user experience",
  },
  {
    key: "3",
    type: "No Ads/Tracking",
    purpose: "We do NOT use any ad-related or third-party tracking cookies",
  },
  {
    key: "4",
    type: "Disable Option",
    purpose: "You can disable cookies anytime in your browser settings",
  },
];

const CookiePolicy = () => {
  return (
    <div
      style={{
        padding: "60px 24px",
        backgroundColor: "#f0fff0",
        minHeight: "100vh",
      }}
    >
      <Card
        bordered={false}
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "48px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Title
          level={2}
          style={{
            color: "#237804",
            fontSize: "32px",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          <PieChartOutlined style={{ marginRight: 8 }} />
          Cookie Policy
        </Title>
        <Paragraph
          style={{
            textAlign: "center",
            fontSize: "18px",
            color: "#595959",
            marginBottom: 32,
          }}
        >
          Our use of cookies — transparent and minimal.
        </Paragraph>

        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
        />

        <Paragraph
          type="secondary"
          style={{ marginTop: 32, textAlign: "center" }}
        >
          By using this site, you accept our cookie usage as outlined.
        </Paragraph>
      </Card>
    </div>
  );
};

export default CookiePolicy;
