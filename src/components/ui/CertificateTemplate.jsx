export const CertificateTemplate = ({
  userName,
  courseTitle,
  completionDate,
  certificateId,
  instructorName,
}) => {
  return (
    <div
      style={{
        width: "1600px",
        height: "1000px", // ✅ 16:10
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Georgia", "Times New Roman", serif',
        boxSizing: "border-box",
      }}
    >
      {/* Inner Certificate */}
      <div
        style={{
          width: "1460px",
          height: "900px",
          background: "#ffffff",
          position: "relative",
          padding: "90px 110px",
          boxSizing: "border-box",
        }}
      >
        {/* Safe Border */}
        <div
          style={{
            position: "absolute",
            inset: "30px",
            border: "5px solid #4f6df5",
            boxSizing: "border-box",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            textAlign: "center",
          }}
        >
          {/* Header */}
          <div>
            <div
              style={{
                fontSize: "26px",
                letterSpacing: "4px",
                color: "#4f6df5",
                fontWeight: 700,
              }}
            >
              SKILLCERTS
            </div>

            <div
              style={{
                marginTop: "36px",
                fontSize: "62px",
                letterSpacing: "6px",
                color: "#1f2937",
                fontWeight: 700,
              }}
            >
              CERTIFICATE
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "22px",
                letterSpacing: "3px",
                color: "#6b7280",
              }}
            >
              OF COMPLETION
            </div>

            <div
              style={{
                width: "220px",
                height: "3px",
                background: "#4f6df5",
                margin: "36px auto",
              }}
            />
          </div>

          {/* Body */}
          <div>
            <div
              style={{
                fontSize: "20px",
                color: "#6b7280",
                fontStyle: "italic",
              }}
            >
              This certificate is proudly presented to
            </div>

            <div
              style={{
                marginTop: "24px",
                fontSize: "50px",
                fontWeight: 700,
                color: "#4f6df5",
                textTransform: "capitalize",
              }}
            >
              {userName}
            </div>

            <div
              style={{
                marginTop: "20px",
                fontSize: "20px",
                color: "#6b7280",
              }}
            >
              for successfully completing the course
            </div>

            <div
              style={{
                marginTop: "28px",
                fontSize: "34px",
                fontWeight: 700,
                color: "#1f2937",
                padding: "0 140px",
                lineHeight: "1.45",
              }}
            >
              {courseTitle}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              padding: "0 20px",
            }}
          >
            {/* Date */}
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: "14px",
                  letterSpacing: "1.5px",
                  color: "#6b7280",
                }}
              >
                DATE OF COMPLETION
              </div>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              >
                {completionDate}
              </div>
            </div>

            {/* Instructor */}
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  width: "240px",
                  height: "3px",
                  background: "#1f2937",
                  marginLeft: "auto",
                  marginBottom: "8px",
                }}
              />
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              >
                {instructorName}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  letterSpacing: "1.5px",
                  color: "#6b7280",
                  marginTop: "6px",
                }}
              >
                COURSE INSTRUCTOR
              </div>
            </div>
          </div>

          {/* Certificate ID */}
          <div
            style={{
              marginTop: "28px",
              fontSize: "14px",
              letterSpacing: "1.2px",
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            Certificate ID:{" "}
            <span
              style={{
                fontFamily: '"Courier New", monospace',
                fontWeight: 700,
                color: "#374151",
              }}
            >
              {certificateId}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
