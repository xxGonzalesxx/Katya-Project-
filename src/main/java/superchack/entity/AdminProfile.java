package superchack.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class AdminProfile {

    @Id
    @Column(name="admin_profile")
    private Long adminId;

    @OneToOne
    @MapsId
    @JoinColumn(name="admin_id")
    private Users users;

    @Column(name="access_level",nullable = false)
    private Short accessLevel;
}
