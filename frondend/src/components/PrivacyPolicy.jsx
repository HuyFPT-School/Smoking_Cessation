import { Card, Typography, Table, Divider } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const data = [
  {
    key: "1",
    policy: "Data Encryption",
    purpose: "All data is encrypted both in transit and at rest.",
  },
  {
    key: "2",
    policy: "Minimal Data Collection",
    purpose:
      "Only essential information is collected to improve your experience.",
  },
  {
    key: "3",
    policy: "No Medical Advice",
    purpose: "AI suggestions are for support only, not medical guidance.",
  },
  {
    key: "4",
    policy: "No Data Sharing",
    purpose: "Your personal data is never shared without your consent.",
  },
  {
    key: "5",
    policy: "Right to Deletion",
    purpose: "You can request deletion of your account and data anytime.",
  },
];

const columns = [
  {
    title: "Policy",
    dataIndex: "policy",
    key: "policy",
    render: (text) => <strong style={{ color: "#237804" }}>{text}</strong>,
  },
  {
    title: "Purpose",
    dataIndex: "purpose",
    key: "purpose",
  },
];

const PrivacyPolicy = () => {
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
          <LockOutlined style={{ marginRight: 8 }} />
          Privacy Policy
        </Title>
        <Paragraph
          style={{
            textAlign: "center",
            fontSize: "18px",
            color: "#595959",
            marginBottom: 32,
            lineHeight: 1.7,
          }}
        >
          We are committed to protecting your privacy. Here's how we handle your
          data:
        </Paragraph>

        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
        />

        <Divider style={{ borderColor: "#e6f4ea", marginTop: 32 }} />
        <Paragraph type="secondary" style={{ textAlign: "center" }}>
          Last updated: July 20, 2025
        </Paragraph>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
