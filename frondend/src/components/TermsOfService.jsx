import { Table, Card, Typography } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const data = [
  {
    key: "1",
    term: "Respectful use",
    description: "Use the platform legally and respectfully.",
  },
  {
    key: "2",
    term: "No fake info",
    description: "Do not post offensive or misleading content.",
  },
  {
    key: "3",
    term: "One account rule",
    description: "Each user must only have one account.",
  },
  {
    key: "4",
    term: "Moderation",
    description: "Admins may remove inappropriate content or users.",
  },
];

const columns = [
  {
    title: "Term",
    dataIndex: "term",
    key: "term",
    render: (text) => <strong style={{ color: "#237804" }}>{text}</strong>,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
];

const TermsOfService = () => {
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
          <FileTextOutlined style={{ marginRight: 8 }} />
          Terms of Service
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
          Please read the terms before using our platform.
        </Paragraph>

        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
          style={{ marginTop: 24 }}
        />
      </Card>
    </div>
  );
};

export default TermsOfService;
