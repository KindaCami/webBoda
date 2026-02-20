-- ==========================================
-- PROYECTO BODA - SCRIPT DE BASE DE DATOS
-- Archivo: database_schema.sql
-- ==========================================

-- 1. LIMPIEZA (Si quisieras reiniciar todo)
DROP TRIGGER IF EXISTS check_accommodation_limit_before_update;
DROP TABLE IF EXISTS game_results;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS invitation_groups;
DROP TABLE IF EXISTS settings;

-- 2. CONFIGURACIÓN
CREATE TABLE settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value INT NOT NULL
);
INSERT INTO settings (setting_key, setting_value) VALUES ('max_accommodation_spots', 100);

-- 3. GRUPOS DE INVITACIÓN (Corregido: invitation_groups)
CREATE TABLE invitation_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    access_code VARCHAR(20) UNIQUE NOT NULL,
    is_vip BOOLEAN DEFAULT FALSE,
    max_members INT DEFAULT 2
) ENGINE=InnoDB;

-- 4. INVITADOS
CREATE TABLE guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    
    -- Asistencia Eventos
    attending_ceremony_2026 BOOLEAN DEFAULT FALSE,
    attending_friday_2027 BOOLEAN DEFAULT FALSE,
    attending_saturday_2027 BOOLEAN DEFAULT FALSE,
    attending_sunday_2027 BOOLEAN DEFAULT FALSE,
    
    -- Alojamiento
    needs_accommodation BOOLEAN DEFAULT FALSE,
    accommodation_status ENUM('confirmed_free', 'waiting_list', 'pay_own', 'not_needed') DEFAULT 'not_needed',
    
    -- Extras
    allergies_specifications TEXT,
    confirmed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_group FOREIGN KEY (group_id) 
        REFERENCES invitation_groups(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. JUEGO PHASER (Resultados)
CREATE TABLE game_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    prize_category VARCHAR(50),
    score INT DEFAULT 0,
    won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_guest_game FOREIGN KEY (guest_id) 
        REFERENCES guests(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. TRIGGER DE CONTROL DE CAMAS
DELIMITER //
CREATE TRIGGER check_accommodation_limit_before_update
BEFORE UPDATE ON guests
FOR EACH ROW
BEGIN
    DECLARE is_group_vip BOOLEAN;
    DECLARE spots_taken INT;
    DECLARE max_spots INT;

    IF NEW.needs_accommodation = TRUE THEN
        -- Verificar si es VIP
        SELECT is_vip INTO is_group_vip FROM invitation_groups WHERE id = NEW.group_id;
        
        IF is_group_vip = TRUE THEN
            SET NEW.accommodation_status = 'confirmed_free';
        ELSE
            -- Contar camas ocupadas
            SELECT setting_value INTO max_spots FROM settings WHERE setting_key = 'max_accommodation_spots';
            SELECT COUNT(*) INTO spots_taken FROM guests WHERE accommodation_status = 'confirmed_free';
            
            IF spots_taken < max_spots THEN
                SET NEW.accommodation_status = 'confirmed_free';
            ELSE
                IF OLD.accommodation_status != 'confirmed_free' THEN
                    SET NEW.accommodation_status = 'waiting_list';
                END IF;
            END IF;
        END IF;
    ELSE
        SET NEW.accommodation_status = 'not_needed';
    END IF;
END; //
DELIMITER ;

-- 7. DATOS DE EJEMPLO
INSERT INTO invitation_groups (group_name, access_code, is_vip, max_members) 
VALUES ('Familia VIP', 'PADRES-VIP', TRUE, 4);

INSERT INTO invitation_groups (group_name, access_code, is_vip, max_members) 
VALUES ('Amigos Gym', 'GYM-2027', FALSE, 2);

INSERT INTO guests (group_id, fullname, needs_accommodation) 
VALUES (1, 'Mamá VIP', TRUE);