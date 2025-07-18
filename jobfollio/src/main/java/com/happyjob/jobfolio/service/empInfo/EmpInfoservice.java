package com.happyjob.jobfolio.service.empInfo;

import com.happyjob.jobfolio.repository.empInfo.EmpInfoMapper;
import com.happyjob.jobfolio.vo.empInfo.EmpInfoModel;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EmpInfoservice {

// Set logger
private final Logger logger = LogManager.getLogger(this.getClass());

// Get class name for logger
private final String className = this.getClass().toString();


@Autowired
	private EmpInfoMapper empInfoMapper;
	
	public List<EmpInfoModel>  EmpInfolist(Map<String, Object> parammap) {
	
		//사원정보 리스트
		List<EmpInfoModel> empList = empInfoMapper.empInfolist(parammap);
		//tree 부서 모음
		List<EmpInfoModel> empDeptlist = empInfoMapper.empDeptlist(parammap);
		List<EmpInfoModel> reList = new ArrayList<EmpInfoModel>();
		
		// 1. empDeptlist를 레벨별로 그룹화
        Map<Integer, List<EmpInfoModel>> levelMap = empDeptlist.stream()
                .collect(Collectors.groupingBy(emp -> Integer.parseInt(emp.getLv().toString())));

        // 2. 최상위 레벨 (Lv=1)을 reList로 추가
        List<EmpInfoModel> level1List = levelMap.get(1);
        if (level1List != null) {
        	for(EmpInfoModel empInfo : level1List) {
        		if(empInfo.getBoardVoList() == null) {
        			empInfo.setBoardVoList(new ArrayList<>());
        		}
        	}
            reList.addAll(level1List);
        }

        // 3. 재귀적으로 계층 구조를 구성
        if (reList != null && !reList.isEmpty()) {
            buildHierarchy(reList, levelMap, 2);
        }
        
        // 4. empList 데이터를 reList의 하위 lv로 연결
        attachEmp(reList, empList);
        
        System.out.println("reList");
        System.out.println(reList);
        
		return reList;
	}

	 private static void buildHierarchy(List<EmpInfoModel> currentLevelList, Map<Integer, List<EmpInfoModel>> levelMap, int targetLevel) {
        // 현재 레벨의 리스트를 순회
        for (EmpInfoModel parent : currentLevelList) {
            // 현재 노드의 자식 리스트
            List<EmpInfoModel> childList = levelMap.get(targetLevel);

            if (childList != null) {
                // parent의 dept_cd를 기준으로 자식 노드를 찾아 연결
            	/*
            	 1. empDeptlist.stream()
				역할: empDeptlist라는 리스트를 스트림으로 변환합니다.
				Stream의 의미: 스트림은 Java 8에서 도입된 API로, 컬렉션 데이터(리스트, 배열 등)를 처리할 때 반복문 없이 간결하게 작업을 수행할 수 있도록 설계된 데이터 흐름입니다.
				스트림 사용 이유:
				데이터를 필터링, 변환, 정렬, 그룹화 등 다양한 작업을 간단하게 수행할 수 있음.
				병렬 처리 가능(대규모 데이터 처리 시 유용).
				2. .collect(Collectors.groupingBy(...))
				역할: 스트림의 요소들을 그룹화하고 결과를 Map 형태로 반환합니다.
				groupingBy란?: Java 8의 Collectors 클래스에서 제공하는 유틸리티 메소드로, 데이터의 특정 속성 값을 기준으로 그룹화하는 기능을 제공합니다.
				결과: Map<K, List<T>> 형태의 데이터가 만들어집니다.
				K: 그룹화의 기준이 되는 키(Lv 값).
				List<T>: 해당 그룹에 속하는 값들의 리스트(EmpInfoModel 객체).
				3. emp -> Integer.parseInt(emp.getLv().toString())
				역할: groupingBy에 그룹화의 기준을 정의합니다. 여기서 기준은 Lv 값입니다.
				내용:
				emp는 empDeptlist의 각 요소(EmpInfoModel 객체)입니다.
				emp.getLv():
				각 객체의 Lv 값을 가져옵니다.
				예: Lv 값이 1, 2, 3 등으로 나옴.
				.toString():
				Lv 값이 숫자형이더라도 문자열로 변환합니다.
				일반적으로 생략 가능하지만, 객체 타입이 명시적으로 숫자가 아닐 경우 안전성을 위해 추가한 것으로 보입니다.
				Integer.parseInt(...):
				Lv 값을 문자열에서 정수로 변환합니다.
				그룹화의 키를 숫자(Integer)로 사용하기 위해 변환한 것입니다.
            	 */
                List<EmpInfoModel> matchedChildren = childList.stream()
                        .filter(child -> parent.getDept_cd().toString().equals(child.getUp_dept_cd().toString()))
                        .collect(Collectors.toList());

                // 자식 노드가 비어 있다면 재귀 호출을 종료
                if (matchedChildren.isEmpty()) {
                    continue;
                }
                
                // 연결된 자식 리스트를 parent의 boardVoList에 추가
            	// Null 체크 및 초기화
                if (parent.getBoardVoList() == null) {
                    parent.setBoardVoList(new ArrayList<>());
                }
                parent.getBoardVoList().addAll(matchedChildren);

                // 다음 레벨을 처리 (재귀 호출)
                buildHierarchy(matchedChildren, levelMap, targetLevel + 1);
            }
        }
    }
	 
	 private static void attachEmp(List<EmpInfoModel> deptList, List<EmpInfoModel> empList) {
		 for (EmpInfoModel dept : deptList) {
			 String continueFlag = "N";
	        // 현재 노드 처리
			 System.out.println("현재 deptCd = "+dept.getDept_cd());
			 System.out.println("현재 deptname = "+dept.getDept_name());
			 for(EmpInfoModel empInfo : empList) {
				if(empInfo.getDept_cd().toString().equals(dept.getDept_cd().toString())) {
					System.out.println("dept에 들어간 empName = "+empInfo.getEmp_name());
					if (dept.getBoardVoList() == null) {
	                    dept.setBoardVoList(new ArrayList<>());
	                }
	                dept.getBoardVoList().add(empInfo);
	                continueFlag = "Y";
				}
			 }
	        // 하위 계층이 있는 경우 처리
	        if (dept.getBoardVoList() != null && !dept.getBoardVoList().isEmpty() && "N".equals(continueFlag)) {
	        	attachEmp(dept.getBoardVoList(), empList); // 재귀 호출
	        }
	    }
	 }
	 
	public int  EmpInfolisttotalcnt(Map<String, Object> parammap) {
		return empInfoMapper.empInfolisttotalcnt(parammap);
	}

	public EmpInfoModel  EmpInfodetail(Map<String, Object> parammap) {
	
		return empInfoMapper.empInfodetail(parammap);
	}

	public int insertEmpInfo(Map<String, Object> paramMap) {
		return empInfoMapper.insertEmpInfo(paramMap);
	}

	public int updateEmpInfo(Map<String, Object> paramMap) {
		return empInfoMapper.updateEmpInfo(paramMap);
	}

}
