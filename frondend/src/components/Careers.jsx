import { Card, Typography, List, Tag, Divider } from "antd";
import { UserAddOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const positions = [
  { title: "React Developer", tag: "Frontend Development" },
  { title: "Spring Boot Backend Engineer", tag: "Backend Development" },
  { title: "AI Research Intern", tag: "AI / NLP" },
  { title: "Community Moderator", tag: "Forum & Support" },
];

const Careers = () => {
  return (
    <div style={{ padding: "60px 24px", backgroundColor: "#f0fff0", minHeight: "100vh" }}>
      <Card bordered={false} style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "48px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
      }}>
        <Title level={2} style={{ color: "#237804", fontSize: "32px", fontWeight: 800, textAlign: "center" }}>
          <UserAddOutlined style={{ marginRight: 8 }} />
          Join Our Team
        </Title>
        <Paragraph style={{ textAlign: "center", fontSize: "18px", color: "#595959", marginBottom: 32 }}>
          We're on a mission to help people quit smoking. Be part of a positive change.
        </Paragraph>

        <Divider style={{ borderColor: "#e6f4ea" }} />

        <List
          itemLayout="horizontal"
          dataSource={positions}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={<Text style={{ fontSize: "18px", fontWeight: 600, color: "#135200" }}>{item.title}</Text>}
                description={<Tag color="green">{item.tag}</Tag>}
              />
            </List.Item>
          )}
        />

        <Paragraph style={{ marginTop: 32, textAlign: "center", fontSize: "16px" }}>
          Send your CV to: <Text strong style={{ color: "#237804" }}>hr@scsp-platform.com</Text>
        </Paragraph>
      </Card>
    </div>
  );
};

export default Careers;
