package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tracking")
@Getter
@Setter
public class Tracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tracking_id", length = 45)
    private int id;

    @Column(name = "date", length = 10, nullable = false) // "YYYY-MM-DD"
    private String date;

    @Column(name = "time", length = 10) // "hh:mm A"
    private String time;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "trigger_value", length = 255) // Changed from 'trigger'
    private String trigger_value;

    @Column(name = "satisfaction")
    private int satisfaction;

    @Column(name = "type", length = 20) // "smoking"
    private String type;

    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY) // Chỉ tải User khi gọi getUser()
    @JoinColumn(name = "user_id") // Tên cột khóa ngoại
    private User user;
}
