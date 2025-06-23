import { useEffect, useState } from "react";
import "../../../css/user/myPageComponent/UserInfo.css";
import "../../../css/user/join/FindAccountForm.css"; // 비밀번호 변경 모달용 스타일
import { useAuth } from "../../../context/AuthContext";
import axios from "../../../utils/axiosConfig";

const UserInfo = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    user_no: "",
    user_name: "",
    hp: "",
    login_id: "",
    address: "",
    expire_days: "",
  });

  // 🔐 유저정보 불러오기
  const fetchUserInfo = async () => {
    try {
      if (!user?.userNo) {
        console.log("사용자 정보가 없습니다.");
        return;
      }

      const data = await axios.get(`/api/myPage/userInfo/${user.userNo}`);
      console.log("사용자 상세정보:", data);

      setUserInfo({
        user_no: data.user_no,
        user_name: data.user_name,
        hp: data.hp,
        login_id: data.login_id,
        address: data.address ?? "",
        expire_days: data.expire_days
          ? (() => {
              const date = new Date(data.expire_days);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            })()
          : "미구독",
      });
    } catch (err) {
      console.error("Failed to fetch userInfo:", err);
    }
  };

  useEffect(() => {
    if (user?.userNo) {
      fetchUserInfo();
    }
  }, [user]);

  // 🔧 유저정보 수정
  const handleEditClick = async () => {
    if (!isEditing) {
      setIsEditing(true);
    } else {
      try {
        if (!user?.userNo) {
          console.error("사용자 정보가 없습니다.");
          return;
        }

        if (window.confirm("수정하시겠습니까?")) {
          const cleanedUserInfo = {
            ...userInfo,
            user_no: user.userNo,
            address: userInfo.address === "" ? null : userInfo.address,
            expire_days:
              userInfo.expire_days === "미구독" ? null : userInfo.expire_days,
          };

          const response = await axios.post(
            `/api/myPage/editUserInfo`,
            cleanedUserInfo
          );

          if (response !== null) {
            alert("수정이 완료되었습니다.");
            setIsEditing(false);
          } else {
            alert("수정 실패: " + response.statusText);
          }
        }
      } catch (err) {
        console.error("Failed to update userInfo:", err);
        alert("수정 중 오류 발생");
      }
    }
  };

  // 🗑️ 유저 정보 삭제 (탈퇴)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  const handleDelete = async () => {
    if (!user?.userNo) {
      console.error("사용자 정보가 없습니다.");
      return;
    }

    if (window.confirm("정말 탈퇴하시겠습니까?")) {
      setIsPasswordModalOpen(true);
    }
  };

  const userInfoCheck = async () => {
    try {
      const response = await axios.post(`/api/join/userInfoCheck`, {
        password: password,
      });

      if (response?.result === "Y") {
        alert("탈퇴가 완료되었습니다.");
        logout();
      } else {
        alert(response?.message || "비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error("탈퇴 요청 실패:", error);
      alert("탈퇴 중 오류가 발생했습니다.");
    }
  };

  // 🔑 비밀번호 변경 기능 (개선된 UI)
  const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] =
    useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // 비밀번호 변경 버튼 클릭
  const handlePasswordChangeClick = () => {
    setIsPasswordChangeModalOpen(true);
    setPasswordError("");
    setPasswordChangeData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // 비밀번호 변경 처리 (1단계 프로세스로 변경)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setIsPasswordLoading(true);

    try {
      const { currentPassword, newPassword, confirmPassword } =
        passwordChangeData;

      // 입력값 검증
      if (!currentPassword.trim()) {
        setPasswordError("현재 비밀번호를 입력해주세요.");
        setIsPasswordLoading(false);
        return;
      }

      if (!newPassword.trim()) {
        setPasswordError("새 비밀번호를 입력해주세요.");
        setIsPasswordLoading(false);
        return;
      }

      if (!confirmPassword.trim()) {
        setPasswordError("새 비밀번호 확인을 입력해주세요.");
        setIsPasswordLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        setIsPasswordLoading(false);
        return;
      }

      if (newPassword.length < 4) {
        setPasswordError("새 비밀번호는 4자 이상이어야 합니다.");
        setIsPasswordLoading(false);
        return;
      }

      if (currentPassword === newPassword) {
        setPasswordError("현재 비밀번호와 새 비밀번호가 동일합니다.");
        setIsPasswordLoading(false);
        return;
      }

      // 비밀번호 변경 API 호출
      const response = await axios.post("/api/join/change-password", {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      if (response?.result === "Y") {
        alert(
          "비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해주세요."
        );
        setIsPasswordChangeModalOpen(false);
        setPasswordChangeData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        logout(); // 비밀번호 변경 후 자동 로그아웃
      } else {
        setPasswordError(response?.message || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      setPasswordError(
        error.message || "비밀번호 변경 중 오류가 발생했습니다."
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  // 📍 주소 검색 기능
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [tempBaseAddress, setTempBaseAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let fullAddress = data.roadAddress;
        if (data.buildingName) {
          fullAddress += ` (${data.buildingName})`;
        }
        fullAddress = `(${data.zonecode}) ${fullAddress}`;

        setTempBaseAddress(fullAddress);
        setIsDetailModalOpen(true);
      },
    }).open();
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    fetchUserInfo();
  };

  const handleOverlayClick = (e) => {
    e.stopPropagation();
  };

  // 🔄 로딩 상태 처리
  if (!user) {
    return (
      <div className="userInfoWrap">
        <div className="userInfoContent">
          <p>사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="userInfoWrap">
      <div className="userInfoContent">
        <div className="userInfobuttonWrap">
          {isEditing && (
            <button className="userInfoBackButton3" onClick={handleCancelClick}>
              취소하기
            </button>
          )}
          <button className="userInfoBackButton" onClick={handleEditClick}>
            수정하기
          </button>
          <button
            className="userInfoBackButton"
            onClick={handlePasswordChangeClick}
          >
            비밀번호 변경
          </button>
        </div>
        <hr />

        <div className="userInfoRow">
          <p>이름</p>
          <input
            type="text"
            className={`userInfoInput ${
              isEditing ? "userInfoInput--editable" : ""
            }`}
            value={userInfo.user_name}
            onChange={(e) =>
              setUserInfo({ ...userInfo, user_name: e.target.value })
            }
            readOnly={!isEditing}
          />
        </div>
        <hr />

        <div className="userInfoRow">
          <p>연락처</p>
          <input
            type="text"
            className={`userInfoInput ${
              isEditing ? "userInfoInput--editable" : ""
            }`}
            value={userInfo.hp}
            onChange={(e) => setUserInfo({ ...userInfo, hp: e.target.value })}
            readOnly={!isEditing}
          />
        </div>
        <hr />

        <div className="userInfoRow">
          <p>이메일</p>
          <input
            type="text"
            className={`userInfoInput ${
              isEditing ? "userInfoInput--editable" : ""
            }`}
            value={userInfo.login_id}
            readOnly
          />
        </div>
        <hr />

        <div className="userInfoRow">
          <p>주소</p>
          <input
            type="text"
            className={`userInfoInput ${
              isEditing ? "userInfoInput--editable" : ""
            }`}
            value={userInfo.address}
            onClick={() => {
              if (isEditing) handleAddressSearch();
            }}
            onChange={(e) =>
              setUserInfo({ ...userInfo, address: e.target.value })
            }
            readOnly
          />
        </div>
        <hr />

        <div className="userInfoRow">
          <p>구독마감일자</p>
          <input
            type="text"
            className={`userInfoInput ${
              isEditing ? "userInfoInput--editable" : ""
            }`}
            value={userInfo.expire_days}
            onChange={(e) =>
              setUserInfo({ ...userInfo, expire_days: e.target.value })
            }
            readOnly
          />
        </div>
        <hr />

        <div className="userInfobuttonWrap_button">
          <button className="userInfoBackButton2" onClick={handleDelete}>
            탈퇴하기
          </button>
        </div>
      </div>

      {/* 📍 상세주소 입력 모달 */}
      {isDetailModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>상세주소 입력</h3>
            <p>{tempBaseAddress}</p>
            <input
              type="text"
              placeholder="상세 주소를 입력하세요"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              className="userInfoInput"
            />
            <div style={{ marginTop: "10px" }}>
              <button
                className="userInfoBackButton"
                onClick={() => {
                  if (!detailAddress.trim()) {
                    alert("상세주소를 입력해주세요.");
                    return;
                  }

                  const finalAddress = `${tempBaseAddress} ${detailAddress.trim()}`;
                  setUserInfo((prev) => ({ ...prev, address: finalAddress }));
                  setIsDetailModalOpen(false);
                  setDetailAddress("");
                }}
              >
                확인
              </button>
              <button
                className="userInfoBackButton3"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setDetailAddress("");
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔐 탈퇴용 비밀번호 확인 모달 */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>비밀번호 입력</h3>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="userInfoInput"
            />
            <div style={{ marginTop: "10px" }}>
              <button
                className="userInfoBackButton"
                onClick={() => {
                  if (!password) {
                    alert("비밀번호를 입력해주세요.");
                    return;
                  }
                  userInfoCheck();
                  setIsPasswordModalOpen(false);
                }}
              >
                확인
              </button>
              <button
                className="userInfoBackButton3"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔑 비밀번호 변경 모달 (개선된 UI) */}
      {isPasswordChangeModalOpen && (
        <div
          className="find-account-modal-overlay"
          onClick={handleOverlayClick}
        >
          <div
            className="find-account-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="find-account-container">
              <h1 className="login-form-title" style={{ marginBottom: 0 }}>
                jobfolio
              </h1>
              <h3
                className="login-form-subtitle"
                style={{ marginTop: 0, marginBottom: "2.2rem" }}
              >
                비밀번호 변경
              </h3>

              {passwordError && (
                <div
                  className="error-message"
                  style={{
                    marginBottom: "1rem",
                    color: "#dc3545",
                    backgroundColor: "#f8d7da",
                    border: "1px solid #f5c6cb",
                    borderRadius: "6px",
                    padding: "12px",
                    fontSize: "14px",
                  }}
                >
                  {passwordError}
                </div>
              )}

              <form
                onSubmit={handlePasswordChange}
                className="find-account-form"
              >
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    className="form-input login-form-input"
                    id="currentPassword"
                    value={passwordChangeData.currentPassword}
                    onChange={(e) =>
                      setPasswordChangeData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="현재 비밀번호를 입력하세요"
                    disabled={isPasswordLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    className="form-input login-form-input"
                    id="newPassword"
                    value={passwordChangeData.newPassword}
                    onChange={(e) =>
                      setPasswordChangeData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="새 비밀번호 (4자 이상)"
                    disabled={isPasswordLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    className="form-input login-form-input"
                    id="confirmPassword"
                    value={passwordChangeData.confirmPassword}
                    onChange={(e) =>
                      setPasswordChangeData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="새 비밀번호를 다시 입력하세요"
                    disabled={isPasswordLoading}
                    required
                  />
                </div>

                <div
                  className="info-box"
                  style={{
                    backgroundColor: "#fff3cd",
                    padding: "15px",
                    borderRadius: "6px",
                    marginBottom: "1.5rem",
                    fontSize: "13px",
                    color: "#856404",
                    border: "1px solid #ffeaa7",
                  }}
                >
                  <strong>⚠️ 주의:</strong> 비밀번호 변경 후 보안을 위해
                  자동으로 로그아웃됩니다.
                </div>

                <div
                  className="button-group"
                  style={{ display: "flex", gap: "10px", marginTop: "2.2rem" }}
                >
                  <button
                    type="button"
                    className="login-form-submit"
                    onClick={() => {
                      setIsPasswordChangeModalOpen(false);
                      setPasswordChangeData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordError("");
                    }}
                    style={{ flex: 1, backgroundColor: "#6c757d" }}
                    disabled={isPasswordLoading}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="login-form-submit"
                    disabled={isPasswordLoading}
                    style={{ flex: 2 }}
                  >
                    {isPasswordLoading ? "변경 중..." : "비밀번호 변경"}
                  </button>
                </div>
              </form>
            </div>
            <button
              className="login-form-close"
              onClick={() => {
                setIsPasswordChangeModalOpen(false);
                setPasswordChangeData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setPasswordError("");
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
