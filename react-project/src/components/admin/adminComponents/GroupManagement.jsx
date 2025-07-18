import '../../../css/admin/adminComponents/GroupManagement.css';
import AdminSideBar from '../AdminSideBar';
import Pagination from '../../common/Pagination.jsx';
import { useState, useEffect, useCallback } from 'react';
import axios from '../../../utils/axiosConfig';
import * as commonjs from "../../common/commonfunction.js";
import Modal from "react-modal";
import GroupDetailpopup from './GroupDetailpopup.jsx';

const GroupManagement = () => {

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [detailcurrentPage, setDetailCurrentPage] = useState(1);
  const [detailtotalCount, setDetailTotalCount] = useState(0);
  const pageSize = 5;
  const totalPages = Math.ceil(totalCount / pageSize);
  const detailtotalPages = Math.ceil(detailtotalCount / pageSize);

  const [searchdata, setSearchdata] = useState({
    stype: "",
    searchword: "",
    useyn: "",
    cpage: currentPage,
    pagesize: pageSize,
    blocksize: 10,
  });

  const [groupdata, setGroupdata] = useState({
    grouplist: [],
    totalcnt: totalCount,
  });

  const [groupmodalopen, setGroupmodalopen] = useState({
    isopen: false,
  });

  const [groupeditdata, setGroupeditdata] = useState({
    readonly: false,
    group_code: "",
    group_name: "",
    note: "",
    useyn: "Y",
    modtype: false,
    action: "I",
    title: "",
    delyn: "N",
    category_code: "",
  });

  /////////////////////////////상세 코드//////////////////////////////
  const [detaildata, setDetaildata] = useState({
    detaillist: [],
    totalcnt: detailtotalCount,
    group_code: "",
    cpage: detailcurrentPage,
    pagesize: pageSize,
  });

  const [detailmodalopen, setDetailmodalopen] = useState({
    isopen: false,
    action: "",
    detailcode: "",
    title: "",
  });

  // 초기 화면 설정
  const groupsearch = async () => {
    // 상세 코드 목록 초기화
    setDetaildata(prev => ({
      ...prev,
      detaillist: [],
      totalcnt: 0,
      group_code: '',
      cpage: 1,
    }));

    const payload = {
      searchdata: {
        ...searchdata,
        cpage: currentPage,
        pagesize: pageSize
      }
    };

    await axios.post('/api/admin/listgroupcode', payload)
      .then(response => {

        setGroupdata(prev => ({
          ...prev,
          grouplist: response.commcodeModel,
          totalcnt: response.totalcnt,
        }));
        setTotalCount(response.totalcnt)
      })
      .catch(error => {
        console.error('Group Code Data 요청 중 Error 발생', error);
      });
  };

  // 그룹코드 수정
  const groupcodemodify = async (groupcode) => {


    await axios
      .post("/api/admin/selectgroupcode", { groupcode })
      .then((res) => {
        console.log(res);

        setGroupeditdata((prev) => ({
          ...prev,
          ...res.commcodeModel, // commcodeModel의 키-값을 groupeditdata에 병합
          action: "U",
          modtype: true,
          readonly: true,
        }));
        setGroupmodalopen({ ...groupmodalopen, isopen: true });
      })
      .catch((err) => {
        console.log("noticeUpdate catch start");
        alert(err.message);
      });
  };

  //상세코드 보기
  const grpclick = (pgroupcode) => {
    setDetaildata((prev) => ({
      ...prev,
      group_code: pgroupcode,
      cpage: detailcurrentPage,
      pagesize: pageSize
    }));
  };

  const groupreg = () => {
    // console.log(groupdata.grouplist);

    setGroupmodalopen({ ...groupmodalopen, isopen: true });
    setGroupeditdata({ ...groupeditdata, action: "I", title: "그룹코드 등록", readonly: false });
  };

  const detailsearch = async () => {

    console.log(detaildata);

    await axios
      .post("/api/admin/listdetailcode", { detaildata })
      .then((response) => {
        console.log(response);
        setDetaildata((prevdetaildata) => ({
          ...prevdetaildata,
          detaillist: response.commcodeModel,
          totalcnt: response.totalcnt,
        }));
        setDetailTotalCount(response.totalcnt);
      })
      .catch((err) => {
        console.log("Detail Code List Search Error !!");
        alert(err.message);
      });
  };

  const detailcodemodify = (detail_cd) => {
    setDetailmodalopen((prevdetailmodalopen) => ({
      ...prevdetailmodalopen,
      isopen: true,
      action: "U",
      detailcode: detail_cd,
      title: "상세코드 수정",
    }));
  };

  const groupclosemodal = () => {
    groupeditinit();

    setGroupmodalopen((prevgroupmodalopen) => ({
      ...prevgroupmodalopen,
      isopen: false,
    }));
  };

  const groupeditinit = () => {
    setGroupeditdata((prev) => ({
      ...prev,
      readonly: false,
      action: "",
      group_code: "",
      group_name: "",
      note: "",
      useyn: "Y",
      modtype: false,
      title: "",
      delyn: "N",
    }));
  };

  const groupsave = async (proc) => {
    const checklist = [
      { inval: groupeditdata.group_code, msg: "그룹 코드를 입력해 주세요" },
      { inval: groupeditdata.group_name, msg: "그룹 코드 명를 입력해 주세요" },
    ];

    if (!commonjs.nullcheck(checklist)) return;

    const payload = {
      igroupcode: groupeditdata.group_code,
      igroupname: groupeditdata.group_name,
      inote: groupeditdata.note,
      iuseyn: groupeditdata.useyn,
      category_code: groupeditdata.category_code,
      action: proc === "D" ? "D" : groupeditdata.action
    };

    await axios
      .post("/api/admin/savegroupcode", payload)
      .then((res) => {
        console.log(res);

        if (res.result === "SUCCESS") {
          if (proc === "D") {
            alert("삭제 되었습니다.");
          } else {
            alert("저장 되었습니다.");
          }

          groupclosemodal();
          groupsearch();
        } else {
          alert(res.resultmsg);
        }

        groupeditinit();
      })
      .catch((err) => {
        console.log("noticeUpdate catch start");
        alert(err.message);
      });
  };

  const groupdel = () => {
    if (groupeditdata.delyn === "N") {
      alert("상세 코드가 있어 삭제 할수 없습니다.");
      return;
    }

    groupsave("D");
  };

  useEffect(() => {
    groupsearch();
  }, [currentPage])

  useEffect(() => {
    detailsearch();
  }, [detaildata.group_code, detailcurrentPage]);

  const newdetail = () => {
    if (
      detaildata.group_code === "" ||
      detaildata.group_code === null ||
      detaildata.group_code === undefined
    ) {
      alert("상세 코드 조회를 먼저 해주세요");
      return;
    }

    setDetailmodalopen((prevdetailmodalopen) => ({
      ...prevdetailmodalopen,
      isopen: true,
      action: "I",
      detailcode: "",
      title: "상세코드 등록",
    }));
  };

  const detailclosemodal = (flag) => {
    setDetailmodalopen((prevdetailmodalopen) => ({
      ...prevdetailmodalopen,
      isopen: false,
    }));


    if (flag === true) detailsearch();
  };


  return (
    <div className='group-management'>
      <AdminSideBar />
      <div className="group-manage-content">
        <div className="group-manage-wrapper">
          <div className="group-manage-title">
            <div className="group-manage-title-inner">
              <h2>공통코드 관리</h2>
            </div>
          </div>
          <div className="group-manage-main-code-box">
            <div className="group-manage-main-control">
              <div className="group-manage-main-count">
                <span>총건수 : {totalCount}</span>
                <span>현재 페이지번호 : {currentPage}</span>
              </div>
              <div className='group-manage-main-tap-right'>
                <div className="group-manage-main-search-section">
                  <select
                    id="stype"
                    name="stype"
                    onChange={(e) => {
                      setSearchdata({ ...searchdata, stype: e.target.value });
                    }}
                  >
                    <option value="">전체</option>
                    <option value="code">코드</option>
                    <option value="name">코드명</option>
                  </select>
                  <input
                    type="text"
                    className="form-control"
                    id="searchword"
                    name="searchword"
                    style={{ width: 150 }}
                    onInput={(e) => {
                      setSearchdata({ ...searchdata, searchword: e.target.value });
                    }}
                  />
                  사용 여부
                  <select
                    id="useyn"
                    name="useyn"
                    onChange={(e) => {
                      setSearchdata({ ...searchdata, useyn: e.target.value });
                    }}
                  >
                    <option value="">전체</option>
                    <option value="Y">사용</option>
                    <option value="N">미사용</option>
                  </select>
                  <button
                    className="btn btn-primary mx-2"
                    id="btnSearchGrpcod"
                    name="btn"
                    onClick={groupsearch}
                  >
                    <span> 검 색 </span>
                  </button>
                </div>
                <div className="group-manage-main-button-section">
                  <button
                    className="btn btn-light mx-2"
                    id="btnSearchGrpcod"
                    name="btn"
                    onClick={groupreg}
                  >
                    <span> 신규등록 </span>
                  </button>
                </div>
              </div>
            </div>
            <div className='group-manage-main-table'>
              <table className="group-manage-table main-code">
                <thead>
                  <tr>
                    <th className="col-group-code"> 그룹 코드 </th>
                    <th className="col-group-code-name"> 그룹 코드 명 </th>
                    <th className="col-group-code-yn"> 사용 여부 </th>
                    <th className="col-group-code-category"> 카테고리 </th>
                    <th className="col-group-code-regdate"> 등록 일자 </th>
                    <th className="col-group-code-button"> </th>
                  </tr>
                </thead>
                <tbody>
                  {groupdata.totalcnt === 0 ? (
                    <tr>
                      <td colSpan="4">조회된 데이터가 없습니다.</td>
                    </tr>
                  ) : (
                    groupdata.grouplist.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.group_code}</td>
                          <td
                            className="hoverable-row"
                            onClick={() => grpclick(item.group_code)}
                          >
                            {item.group_name}
                          </td>
                          <td>{item.use_yn}</td>
                          <td>{item.category_code ? item.category_code : "-"}</td>
                          <td>
                            {item.reg_date ? item.reg_date.split(" ")[0] : "-"}
                          </td>
                          <td>
                            <button
                              className="btn btn-default"
                              onClick={() => {
                                groupcodemodify(item.group_code);
                              }}
                            >
                              수정
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <div className='group-manage-main-pagination'>
                <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
              </div>
            </div>
          </div>

          <div className="group-manage-sub-code-box">
            <div className='group-manage-sub-control'>
              <div className="group-manage-sub-count">
                <span>
                  총건수 : {detailtotalCount}
                </span>
                <span>
                  현재 페이지번호 : {detailcurrentPage}
                </span>
              </div>
              <div className="group-manage-sub-tap-right">
                <div className="group-manage-sub-button-section">
                  <button
                    className="btn btn-light"
                    id="btnSearchGrpcod"
                    name="btn"
                    onClick={newdetail}
                  >
                    <span> 신규등록 </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="group-manage-sub-table">
              <table className="group-manage-table sub-code">
                <thead>
                  <tr>
                    <th className="col-group-sub-code"> 상세 코드 </th>
                    <th className="col-group-sub-code-name"> 상세코드 명 </th>
                    <th className="col-group-sub-code-yn"> 사용 여부 </th>
                    <th className="col-group-code-reg-id"> 등록자 </th>
                    <th className="col-group-code-button"> </th>
                  </tr>
                </thead>
                <tbody>
                  {detaildata.totalcnt === 0 ? (
                    <tr>
                      <td colSpan={5}>조회된 데이터가 없습니다.</td>
                    </tr>
                  ) : (
                    detaildata.detaillist.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item.detail_code}</td>
                          <td>{item.detail_name}</td>
                          <td>{item.use_yn || "-"}</td>
                          <td>{item.regId || "-"}</td>
                          <td>
                            <button
                              className="btn btn-default mx-2"
                              onClick={() => {
                                detailcodemodify(item.detail_code);
                              }}
                            >
                              수정
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className='group-manage-sub-pagination'>
              <Pagination currentPage={detailcurrentPage} totalPages={detailtotalPages} setCurrentPage={setDetailCurrentPage} />
            </div>
          </div>
        </div>
      </div>
      <Modal
        className="group-manage-custom-modal-content"
        overlayClassName="custom-modal-overlay"
        isOpen={groupmodalopen.isopen}
        onRequestClose={groupclosemodal}
      >
        <table className="group-manage-modal-content">
          <tbody>
            <tr>
              <td colSpan={4}>
                <p className="conTitle">
                  <span> {groupeditdata.title}</span>
                </p>
              </td>
            </tr>
            <tr>
              <th>그룹 코드</th>
              <td>
                <input
                  type="text"
                  id="group_code"
                  name="group_code"
                  value={groupeditdata.group_code}
                  readOnly={groupeditdata.readonly}
                  onChange={(e) => {
                    setGroupeditdata((prevgroupeditdata) => ({
                      ...prevgroupeditdata,
                      group_code: e.target.value,
                    }));
                  }}
                />
              </td>
              <th>그룹 코드 명</th>
              <td>
                <input
                  type="text"
                  id="group_name"
                  name="group_name"
                  value={groupeditdata.group_name}
                  onChange={(e) => {
                    setGroupeditdata((prevgroupeditdata) => ({
                      ...prevgroupeditdata,
                      group_name: e.target.value,
                    }));
                  }}
                />
              </td>
            </tr>
            <tr>
              <th>내용</th>
              <td colspan="3">
                <textarea
                  id="note"
                  name="note"
                  cols="20"
                  rows="3"
                  value={groupeditdata.note}
                  onChange={(e) => {
                    setGroupeditdata((prevgroupeditdata) => ({
                      ...prevgroupeditdata,
                      note: e.target.value,
                    }));
                  }}
                ></textarea>
              </td>
            </tr>
            <tr>
              <th>사용 유무</th>
              <td colspan="3">
                사용{" "}
                <input
                  type="radio"
                  id="usey"
                  name="useyn"
                  value="Y"
                  checked={groupeditdata.useyn === "Y"}
                  onChange={(e) => {
                    setGroupeditdata((prevgroupeditdata) => ({
                      ...prevgroupeditdata,
                      useyn: e.target.value,
                    }));
                  }}
                />
                미사용{" "}
                <input
                  type="radio"
                  id="usen"
                  name="useyn"
                  value="N"
                  checked={groupeditdata.useyn === "N"}
                  onChange={(e) => {
                    setGroupeditdata((prevgroupeditdata) => ({
                      ...prevgroupeditdata,
                      useyn: e.target.value,
                    }));
                  }}
                />
              </td>
            </tr>
            <tr>
              <th>카테고리 명</th>
              <td>
                <input
                  type="text"
                  id="category_code"
                  name="category_code"
                  value={groupeditdata.category_code}
                  onChange={(e) => {
                    setGroupeditdata((prevgroupeditdata) => ({
                      ...prevgroupeditdata,
                      category_code: e.target.value,
                    }));
                  }}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={4}>
                <div className="modal-button">
                  {<button onClick={groupsave}> 저장 </button>}
                  {groupeditdata.modtype && (
                    <button onClick={groupdel}> 삭제 </button>
                  )}
                  <button onClick={groupclosemodal}> 닫기 </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Modal>
      <Modal
        className="custom-modal-content detail-modal-content"
        overlayClassName="custom-modal-overlay"
        isOpen={detailmodalopen.isopen}
        onRequestClose={detailclosemodal}
      >
        <GroupDetailpopup
          action={detailmodalopen.action}
          detailcode={detailmodalopen.detailcode}
          detailclosemodal={detailclosemodal}
          group_code={detaildata.group_code}
          title={detailmodalopen.title}
        />
      </Modal>
    </div>
  );
};

export default GroupManagement;
