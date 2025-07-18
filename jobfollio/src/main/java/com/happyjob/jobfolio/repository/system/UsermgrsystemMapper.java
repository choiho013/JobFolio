package com.happyjob.jobfolio.repository.system;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.happyjob.jobfolio.vo.system.UsermngModel;

@Mapper
public interface UsermgrsystemMapper {

	public List<UsermngModel> userListvue(Map<String, Object> paramMap);

	public int userListvuetotalcnt(Map<String, Object> paramMap);
	
	public int usercheckLoginID(Map<String, Object> paramMap);
	
	public int userinsert(Map<String, Object> paramMap);
	
	public int userupdate(Map<String, Object> paramMap);
	
	public int userdelete(Map<String, Object> paramMap);
	
	
}