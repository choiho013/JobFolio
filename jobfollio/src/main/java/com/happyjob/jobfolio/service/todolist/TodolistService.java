package com.happyjob.jobfolio.service.todolist;

import com.happyjob.jobfolio.repository.todolist.TodolistMapper;
import com.happyjob.jobfolio.vo.todolist.TodolistModel;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TodolistService {

	// Set logger
	private final Logger logger = LogManager.getLogger(this.getClass());

	// Get class name for logger
	private final String className = this.getClass().toString();

	
	@Autowired
	private TodolistMapper todolistMapper;

	public List<TodolistModel> todolistList(Map<String, Object> paramMap) throws Exception {
		return todolistMapper.todolistList(paramMap);
	}

	public int todoCnt(Map<String, Object> paramMap) throws Exception {
		return todolistMapper.todoCnt(paramMap);
	}
	
	public TodolistModel selectTodolistInfo(Map<String, Object> paramMap) throws Exception {
		return todolistMapper.selectTodolistInfo(paramMap);
	}

	public void insertTodolistInfo(Map<String, Object> paramMap) throws Exception {
		 todolistMapper.insertTodolistInfo(paramMap);

	}
	public void updateTodolistInfo(Map<String, Object> paramMap) throws Exception {
		todolistMapper.updateTodolistInfo(paramMap);

	}
	public void deleteTodolistInfo(Map<String, Object> paramMap) throws Exception {
		todolistMapper.deleteTodolistInfo(paramMap);

	}

	public void todolistComplete(Map<String, Object> paramMap) throws Exception {
		todolistMapper.todolistComplete(paramMap);
	}	
	
	

}