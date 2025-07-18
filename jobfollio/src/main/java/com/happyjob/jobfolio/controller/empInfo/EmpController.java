package com.happyjob.jobfolio.controller.empInfo;

import com.happyjob.jobfolio.service.empInfo.EmpInfoservice;
import com.happyjob.jobfolio.service.movie.Movieservice;
import com.happyjob.jobfolio.vo.movie.MovieModel;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/emp/")
public class EmpController {

    // Set logger
    private final Logger logger = LogManager.getLogger(this.getClass());

    // Get class name for logger
    private final String className = this.getClass().toString();

    @Autowired
    private EmpInfoservice empInfoservice;

    @RequestMapping("/empInfolist")
    @ResponseBody
    public Map<String, Object> empInfolist(Model model, @RequestParam Map<String, Object> paramMap, HttpServletRequest request,
                                             HttpServletResponse response, HttpSession session) throws Exception {

        logger.info("+ Start !!!!" + className);
        logger.info("   - ParamMap : " + paramMap);

		int cpage = Integer.parseInt((String) paramMap.get("cpage"));
		int pagesize = Integer.parseInt((String) paramMap.get("pagesize"));
		int startpoint = (cpage - 1) * pagesize;
		  
		paramMap.put("startpoint",startpoint);
		paramMap.put("pagesize",pagesize);
        
        Map<String, Object> resultMap = new HashMap<String, Object>();

        // List<MovieModel> productlist = movieservice.movielist(paramMap);

        resultMap.put("empInfolist",empInfoservice.EmpInfolist(paramMap));
        resultMap.put("totalcnt",empInfoservice.EmpInfolisttotalcnt(paramMap));

        logger.info("+ End " + className);

        return resultMap;
    }
    
    @RequestMapping("/save")
	@ResponseBody
	public Map<String, Object> saveEmpInfo(Model model, @RequestParam Map<String, Object> paramMap, HttpServletRequest request,
	         HttpServletResponse response, HttpSession session) throws Exception {

	      logger.info("+ Start Commcodecontroller.saveEmpInfo");
		  logger.info("   - ParamMap : " + paramMap);
		    
		  String result;
		  String resultMsg;
		  Map<String, Object> resultMap = new HashMap<String, Object>();
		  
		  String action = (String) paramMap.get("action");
		  paramMap.put("liginid",(String)session.getAttribute("loginId"));
		  
		  try {
			  
			  if("I".equals(action)) {
				  empInfoservice.insertEmpInfo(paramMap);
			  } else if("U".equals(action)) {
				  empInfoservice.updateEmpInfo(paramMap);				  
			  }

		      resultMap.put("result", "SUCCESS");
	  
		  } catch (Exception e) {
			  resultMap.put("result", "FAIL");
			  resultMap.put("resultmsg", e.getMessage());
		  }	  
	  
	  
	    logger.info("+ End Commcodecontroller.saveEmpInfo");

	    return resultMap;
    }

}
